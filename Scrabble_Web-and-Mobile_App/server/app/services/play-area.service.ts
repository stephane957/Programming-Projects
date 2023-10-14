import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';
import { LetterBankService } from './letter-bank.service';
import { StandService } from './stand.service';
import { VirtualPlayerService } from './virtual-player.service';
import AvatarService from '@app/services/avatar.service';
import { PowerCardsService } from './power-cards.service';
import { ChatMessage } from '@app/classes/chat-message';
import { TranslateService } from '@app/services/translate.service';

@Service()
export class PlayAreaService {
    sio: io.Server;
    avatarService = new AvatarService();
    constructor(
        private standService: StandService,
        private letterBankService: LetterBankService,
        private virtualPService: VirtualPlayerService,
        private chatService: ChatService,
        private databaseService: DatabaseService,
        private boardService: BoardService,
        private powerCardService: PowerCardsService,
        private translateService: TranslateService,
    ) {
        this.sio = new io.Server();
    }

    initSioPlayArea(sio: io.Server) {
        this.sio = sio;
    }

    changePlayer(game: GameServer) {
        // removes all temporary tiles and get the tmp that were in the board
        const tmpLetter = this.boardService.rmTempTiles(game);
        // Update les tiles du board en old
        this.updateOldTiles(game);

        const playerThatJustPlayed = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
        if (playerThatJustPlayed) {
            // we add the tmp letter to the stand of the player that just played
            this.standService.putLettersOnStand(game, tmpLetter, playerThatJustPlayed);
            // update the variable that contains the number of letter in the reserve
            this.updateStandAndReserveView(game, playerThatJustPlayed);
            // add a turn to the player that just played
            playerThatJustPlayed.turn += 1;

            if (game.jmpNextEnnemyTurn) {
                game.jmpNextEnnemyTurn = false;
                // we go to the next player that was supposed to play
                game.idxPlayerPlaying = (game.idxPlayerPlaying + 1) % game.mapPlayers.size;
                // we send a message to everyone in the room to tell that someone used a powerCard
                this.sendMsgToAllInRoomWithTranslation(game, [
                    'THE_PLAYER',
                    playerThatJustPlayed.name,
                    'HAS_USED',
                    Array.from(game.mapPlayers.values())[game.idxPlayerPlaying].name,
                    'HAS_BEEN_JUMPED',
                ]);
            }
        }
        // is the game is finished we stop the game
        if (game.gameFinished && playerThatJustPlayed) {
            this.sendGameToAllClientInRoom(game);
            this.triggerStopTimer(game);
            return;
        }

        // changes the current player
        game.idxPlayerPlaying = (game.idxPlayerPlaying + 1) % game.mapPlayers.size;
        const playerPlaying = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
        if (playerPlaying.id === 'virtualPlayer') {
            this.virtualPlayerAction(game, playerPlaying);
        }

        // reset le timer pour les deux clients
        this.triggerTimer(game);

        // Updates the game of all players
        this.sendGameToAllClientInRoom(game);
    }

    playGame(game: GameServer) {
        // Basic set of values
        game.nbLetterReserve = this.letterBankService.getNbLettersInLetterBank(game.letterBank);
        game.gameStarted = true;
        game.startTime = new Date().getTime();

        // init the stand for each player
        for (const player of game.mapPlayers.values()) {
            this.standService.onInitStandPlayer(game.letters, game.letterBank, player);
        }

        // determine the first player to play and also set this player to the master time
        // (reminder: the master time is the player that controls the timer for the game)
        game.idxPlayerPlaying = Math.floor(Math.random() * game.mapPlayers.size);

        // we set the master timer, it has to be a human client not a virtual player
        game.setMasterTimer();

        // we send the game to all the players
        this.sendGameToAllClientInRoom(game);
        // tell all our clients to start the timer
        this.triggerTimer(game);

        const playerPlaying = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
        // make the virtual player play
        if (playerPlaying && playerPlaying.id === 'virtualPlayer') {
            this.virtualPlayerAction(game, playerPlaying);
        }
        // update board tiles to old
        this.updateOldTiles(game);
    }

    generateNameOpponent(game: GameServer, nameFree: string): string {
        const namesAlrdyUsed: string[] = [];
        for (const player of game.mapPlayers.values()) {
            // we don't add the name that is going to be delete because this is the old player
            if (player.name === nameFree) {
                continue;
            }
            namesAlrdyUsed.push(player.name);
        }
        const nbVPNames = this.databaseService.namesVP.length;
        const randomNumber = this.giveRandomNbOpponent(nbVPNames);
        for (let i = 0; i < nbVPNames; i++) {
            const randomIdx = (randomNumber + i) % nbVPNames;
            const newName: string = this.databaseService.namesVP[randomIdx].firstName + ' ' + this.databaseService.namesVP[randomIdx].lastName;
            if (!namesAlrdyUsed.includes(newName)) {
                return newName;
            }
        }
        return 'no newNameFound';
    }

    // function that transforms the playerThatLeaves into a virtual player
    async replaceHumanByBot(playerThatLeaves: Player, game: GameServer, message: string) {
        // we send to everyone that the player has left and has been replaced by a bot
        this.sendMsgToAllInRoomWithTranslation(game, ['THE_PLAYER', playerThatLeaves?.name, message]);
        this.sendMsgToAllInRoomWithTranslation(game, ['REPLACEMENT_BY_BOT']);

        // we get the index of the person leaving to replace him at the same index later
        const idxPlayerLeaving = Array.from(game.mapPlayers.values()).findIndex((player) => player.name === playerThatLeaves.name);

        let isChangeTurnNeccesary = false;
        // we check if we will have to change the turn of the player that just left
        if (game.gameStarted) {
            // we change the player turn if it was the player that left's turn
            const playerPlaying = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
            if (playerPlaying.id === playerThatLeaves.id) {
                isChangeTurnNeccesary = true;
            }
        }

        // we delete the old player
        game.mapPlayers.delete(playerThatLeaves.name);

        // we replace him with the virtual player
        playerThatLeaves.id = 'virtualPlayer';
        playerThatLeaves.name = this.generateNameOpponent(game, playerThatLeaves.name);
        playerThatLeaves.avatarUri = await this.avatarService.getRandomAvatar();
        this.insertInMapIndex(idxPlayerLeaving, playerThatLeaves.name, playerThatLeaves, game.mapPlayers);

        // if the game is not started we don't need to change the turn
        // furthermore if we entered here game.idxPlayerPlaying would be -1 so server would crash
        if (isChangeTurnNeccesary) {
            this.changePlayer(game);
        }
    }

    sendMsgToAllInRoom(game: GameServer, message: string) {
        for (const player of game.mapPlayers.values()) {
            player.chatHistory.push(new ChatMessage(Constants.SYSTEM_SENDER, message));
        }
        for (const spectator of game.mapSpectators.values()) {
            spectator.chatHistory.push(new ChatMessage(Constants.SYSTEM_SENDER, message));
        }
    }

    sendMsgToAllInRoomWithTranslation(game: GameServer, message: string[]) {
        for (const player of game.mapPlayers.values()) {
            let fullMessage = '';
            message.forEach((element) => {
                const value = this.translateService.translateMessage(player.name, element);
                if (value !== '') {
                    fullMessage += value;
                } else {
                    fullMessage += element;
                }
            });
            player.chatHistory.push(new ChatMessage(Constants.SYSTEM_SENDER, fullMessage));
        }
        for (const spectator of game.mapSpectators.values()) {
            let fullMessage = '';
            message.forEach((element) => {
                const value = this.translateService.translateMessage(spectator.name, element);
                if (value !== '') {
                    fullMessage += value;
                } else {
                    fullMessage += element;
                }
            });
            spectator.chatHistory.push(new ChatMessage(Constants.SYSTEM_SENDER, fullMessage));
        }
    }

    // function used to keep the order of elements in the map
    // we need to keep the ordre because otherwise the change of turn would be wrong
    // since it is based on this order
    insertInMapIndex(index: number, key: string, value: Player, map: Map<string, Player>) {
        const arr = Array.from(map);
        arr.splice(index, 0, [key, value]);
        map.clear();
        arr.forEach(([k, v]) => map.set(k, v));
    }

    private virtualPlayerAction(game: GameServer, player: Player) {
        const fourSecondsWait = 1000;
        const intervalId = setInterval(async () => {
            await this.randomActionVP(game, player);
            if (game.gameMode === Constants.POWER_CARDS_MODE) {
                this.powerCardService.randomPowerCardVP(game, player);
            }
            this.changePlayer(game);
            clearInterval(intervalId);
        }, fourSecondsWait);
    }

    private updateStandAndReserveView(game: GameServer, player: Player) {
        player.nbLetterStand = this.standService.checkNbLetterOnStand(player);
        game.nbLetterReserve = this.letterBankService.getNbLettersInLetterBank(game.letterBank);
    }

    private async randomActionVP(game: GameServer, virtualPlayer: Player) {
        const neinyPercent = 0.9;
        const tenPercent = 0.1;
        const probaMove: number = this.giveProbaMove();

        if (probaMove < tenPercent) {
            // 10% change to change letters
            if (this.letterBankService.getNbLettersInLetterBank(game.letterBank) < Constants.DEFAULT_NB_LETTER_STAND) {
                await this.chatService.passCommand('!passer', game, virtualPlayer);
            } else {
                const lettersExchanged = this.standService.randomExchangeVP(virtualPlayer, game.letters, game.letterBank);
                this.chatService.pushMsgToAllPlayers(game, virtualPlayer.name, '!échanger ' + lettersExchanged, true, 'O');
            }
        } else if (probaMove < neinyPercent) {
            // 80% chances to place a letter
            await this.virtualPService.generateMoves(game, virtualPlayer);
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('soundPlay', Constants.WORD_VALID_SOUND);
        } else {
            await this.chatService.passCommand('!passer', game, virtualPlayer);
        }
    }

    private giveProbaMove(): number {
        return Math.random();
    }

    private updateOldTiles(game: GameServer) {
        const board = game.board;
        board.forEach((line) => {
            line.forEach((tile) => {
                if (tile.letter !== undefined) {
                    if (tile.letter.value !== '' && !tile.old) {
                        tile.old = true;
                    }
                }
            });
        });
    }

    private triggerTimer(game: GameServer) {
        if (game.reduceEnnemyNbTurn > 0) {
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('startClearTimer', {
                minutesByTurn: game.minutesByTurn / 2,
                currentNamePlayerPlaying: Array.from(game.mapPlayers.values())[game.idxPlayerPlaying].name,
            });
            game.reduceEnnemyNbTurn--;

            // we send a message to everyone in the room to tell that someone used a powerCard
            this.sendMsgToAllInRoomWithTranslation(game, ['POWER9']);
        } else {
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('startClearTimer', {
                minutesByTurn: game.minutesByTurn,
                currentNamePlayerPlaying: Array.from(game.mapPlayers.values())[game.idxPlayerPlaying].name,
            });
        }
    }

    private sendGameToAllClientInRoom(game: GameServer) {
        // We send to all clients a gameState and a scoreBoardState\
        this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('gameBoardUpdate', game);

        // we send to all clients an update of the players and spectators
        this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('playersSpectatorsUpdate', {
            roomName: game.roomName,
            players: Array.from(game.mapPlayers.values()),
            spectators: Array.from(game.mapSpectators.values()),
        });

        // we send an update of the player object for each respective client
        for (const player of game.mapPlayers.values()) {
            this.sio.sockets.sockets.get(player.id)?.emit('playerAndStandUpdate', player);
        }
    }

    private triggerStopTimer(game: GameServer) {
        this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('stopTimer');
        for (const player of game.mapPlayers.values()) {
            const endGameMsg = this.translateService.translateMessage(player.name, 'END_GAME_DISPLAY_MSG');
            this.sio.sockets.sockets.get(player.id)?.emit('displayChangeEndGame', endGameMsg);
        }
    }

    private giveRandomNbOpponent(sizeArrayVPOptions: number): number {
        return Math.floor(Math.random() * sizeArrayVPOptions);
    }
}
