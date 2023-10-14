import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { ChatService } from './chat.service';
import { ExpertVP } from './expert-virtual-player.service';
import { LetterBankService } from './letter-bank.service';
import { ObjectiveService } from './objective.service';
import { StandService } from './stand.service';
import { VirtualPlayerService } from './virtual-player.service';

@Service()
export class PlayAreaService {
    sio: io.Server;
    constructor(
        private standService: StandService,
        private letterBankService: LetterBankService,
        private virtualPService: VirtualPlayerService,
        private chatService: ChatService,
        private expertVPService: ExpertVP,
        private objectiveService: ObjectiveService,
    ) {
        this.sio = new io.Server();
    }

    initSioPlayArea(sio: io.Server) {
        this.sio = sio;
    }

    changePlayer(game: GameServer) {
        // Update les tiles du board en old
        this.updateOldTiles(game);
        const playerThatJustPlayed = game.mapPlayers.get(game.currentPlayerId);

        if (playerThatJustPlayed) {
            // update the variable that contains the number of letter in the reserve
            this.updateStandAndReserveView(game, playerThatJustPlayed);
            // add a turn to the player that just played
            playerThatJustPlayed.turn += 1;
        }
        // We verify that the game isn't finished, if it is, we stop the game
        if (game.gameFinished && playerThatJustPlayed) {
            const opponent = game.mapPlayers.get(playerThatJustPlayed.idOpponent);
            if (opponent) {
                this.sendGameToBothPlayer(game, playerThatJustPlayed, opponent);
            }
            this.triggerStopTimer(playerThatJustPlayed);
            return;
        }

        // Changes the current player
        for (const key of game.mapPlayers.keys()) {
            if (key !== game.currentPlayerId) {
                game.currentPlayerId = key;
                break;
            }
        }

        // make the virtual player play if it is his turn and he is activated
        if (game.currentPlayerId === 'virtualPlayer') {
            const virtualPlayer = game.mapPlayers.get('virtualPlayer');
            if (virtualPlayer) {
                this.virtualPlayerAction(game, virtualPlayer);
            }
        }

        const newPlayerToPlay = game.mapPlayers.get(game.currentPlayerId);
        if (newPlayerToPlay && playerThatJustPlayed) {
            // Updates the game of both player
            this.sendGameToBothPlayer(game, playerThatJustPlayed, newPlayerToPlay);
        }
        // reset le timer pour les deux clients
        this.triggerTimer(game);
    }

    playGame(game: GameServer) {
        // Basic set of values
        game.nbLetterReserve = this.letterBankService.getNbLettersInLetterBank(game.letterBank);
        game.gameStarted = true;

        // DETERMINER FIRST PLAYER
        const keys = Array.from(game.mapPlayers.keys());
        game.currentPlayerId = keys[Math.floor(Math.random() * game.mapPlayers.size)];

        const player = game.mapPlayers.get(game.currentPlayerId);

        if (game.gameMode === 'Multi') {
            game.masterTimer = game.currentPlayerId;
        } else if (player) {
            game.masterTimer = player.idPlayer === 'virtualPlayer' ? player.idOpponent : player.idPlayer;
        }

        // tell our two client to start the timer
        let opponent;
        if (player) {
            opponent = game.mapPlayers.get(player.idOpponent);
            if (opponent) {
                this.sendGameToBothPlayer(game, opponent, player);
            }
            this.triggerTimer(game);
        }

        // make the virtual player play
        if (player && game.currentPlayerId === 'virtualPlayer') {
            this.virtualPlayerAction(game, player);
        }
        // update board tiles to old
        this.updateOldTiles(game);
    }

    generateNameOpponent(namePLayer: string): string {
        const nameVPOptions = ['Mike Oxmol', 'Lee Hwak', 'Hugh Jass'];

        let randomNumber = this.giveRandomNbOpponent(nameVPOptions.length);
        while (namePLayer === nameVPOptions[randomNumber]) {
            if (randomNumber === nameVPOptions.length - 1) {
                randomNumber--;
            } else {
                randomNumber++;
            }
        }
        return nameVPOptions[randomNumber];
    }

    replaceHumanByBot(playerThatLeaves: Player, opponent: Player, game: GameServer, message: string) {
        // we send to the opponent the fact that the player disconnected
        opponent.chatHistory.push({ message: 'Le joueur ' + playerThatLeaves?.name + message, isCommand: false, sender: 'S' });
        opponent.chatHistory.push({ message: GlobalConstants.REPLACEMENT_BY_BOT, isCommand: false, sender: 'S' });

        const oldIdPlayer = playerThatLeaves.idPlayer;

        game.gameMode = GlobalConstants.MODE_SOLO;
        playerThatLeaves.idPlayer = 'virtualPlayer';
        playerThatLeaves.name = this.generateNameOpponent(opponent.name);
        opponent.idOpponent = 'virtualPlayer';

        // we delete the old player and replacer him with the virtual player
        game.mapPlayers.delete(oldIdPlayer);
        game.mapPlayers.set(playerThatLeaves.idPlayer, playerThatLeaves);

        // we change the player turn if it was the player that left's turn
        if (game.currentPlayerId === oldIdPlayer) {
            this.changePlayer(game);
        }
    }

    private randomActionExpertVP(game: GameServer, player: Player): string {
        let resultCommand = '';

        const choosedMoved = this.expertVPService.generateMoves(game, player);
        if (!choosedMoved) {
            if (game.letterBank.size > GlobalConstants.DEFAULT_NB_LETTER_STAND) {
                const lettersExchanged = this.standService.randomExchangeVP(player, game.letters, game.letterBank, game.vpLevel);
                game.mapPlayers
                    .get(player.idOpponent)
                    ?.chatHistory.push({ message: player.name + ' : !échanger ' + lettersExchanged, isCommand: true, sender: 'O' });
                game.mapPlayers
                    .get(player.idOpponent)
                    ?.chatHistory.push({ message: GlobalConstants.EXCHANGE_OPPONENT_CMD, isCommand: false, sender: 'O' });

                resultCommand = '!échanger ' + lettersExchanged;
            } else {
                this.chatService.passCommand('!passer', game, player);
                resultCommand = '!passer';
            }
        } else {
            resultCommand = '!placer ' + choosedMoved.command + ' ' + choosedMoved.word;
        }

        return resultCommand;
    }

    private virtualPlayerAction(game: GameServer, player: Player) {
        const fourSecondsWait = 4000;
        let resultCommand = '';

        const intervalId = setInterval(() => {
            if (game.vpLevel === 'expert') {
                resultCommand = this.randomActionExpertVP(game, player);
            } else {
                resultCommand = this.randomActionVP(game, player);
            }

            if (player && game.isLog2990Enabled) {
                this.objectiveService.isPlayerObjectivesCompleted(game, player, resultCommand);
            }

            this.changePlayer(game);
            clearInterval(intervalId);
        }, fourSecondsWait);
    }

    private updateStandAndReserveView(game: GameServer, player: Player) {
        player.nbLetterStand = this.standService.checkNbLetterOnStand(player);
        game.nbLetterReserve = this.letterBankService.getNbLettersInLetterBank(game.letterBank);
    }

    private randomActionVP(game: GameServer, player: Player): string {
        const neinyPercent = 0.9;
        const tenPercent = 0.1;
        const probaMove: number = this.giveProbaMove();
        let resultCommand = '';

        if (probaMove < tenPercent) {
            // 10% change to change letters
            if (this.letterBankService.getNbLettersInLetterBank(game.letterBank) < GlobalConstants.DEFAULT_NB_LETTER_STAND) {
                this.chatService.passCommand('!passer', game, player);
                resultCommand = '!passer';
            } else {
                const lettersExchanged = this.standService.randomExchangeVP(player, game.letters, game.letterBank, game.vpLevel);
                game.mapPlayers
                    .get(player.idOpponent)
                    ?.chatHistory.push({ message: player.name + ' : !échanger ' + lettersExchanged, isCommand: true, sender: 'O' });
                resultCommand = '!échanger ' + lettersExchanged;
            }
        } else if (probaMove < neinyPercent) {
            // 80% chances to place a letter
            const choosedMoved = this.virtualPService.generateMoves(game, player);
            if (choosedMoved) {
                resultCommand = '!placer ' + choosedMoved.command + ' ' + choosedMoved.word;
            }
        } else {
            this.chatService.passCommand('!passer', game, player);
            resultCommand = '!passer';
        }

        return resultCommand;
    }

    private giveProbaMove(): number {
        const returnValue: number = Math.random();
        return returnValue;
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
        const player = game.mapPlayers.get(game.currentPlayerId);
        if (!player) {
            return;
        }
        if (game.gameMode === 'Multi') {
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('startClearTimer', {
                minutesByTurn: game.minutesByTurn,
                currentPlayerId: game.currentPlayerId,
            });
            this.sio.sockets.sockets.get(player.idOpponent)?.emit('startClearTimer', {
                minutesByTurn: game.minutesByTurn,
                currentPlayerId: game.currentPlayerId,
            });
        } else {
            if (player.idPlayer === 'virtualPlayer') {
                this.sio.sockets.sockets.get(player.idOpponent)?.emit('startClearTimer', {
                    minutesByTurn: game.minutesByTurn,
                    currentPlayerId: game.currentPlayerId,
                });
            } else {
                this.sio.sockets.sockets.get(player.idPlayer)?.emit('startClearTimer', {
                    minutesByTurn: game.minutesByTurn,
                    currentPlayerId: game.currentPlayerId,
                });
            }
        }
    }

    private sendGameToBothPlayer(game: GameServer, opponent: Player, player: Player) {
        // we send a version of the game to both players
        if (game.gameMode === 'Multi') {
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('gameUpdateClient', {
                game,
                player,
                scoreOpponent: opponent.score,
                nbLetterStandOpponent: opponent.nbLetterStand,
            });
            this.sio.sockets.sockets.get(player.idOpponent)?.emit('gameUpdateClient', {
                game,
                player: opponent,
                scoreOpponent: player.score,
                nbLetterStandOpponent: player.nbLetterStand,
            });
        } else {
            if (player.idPlayer === 'virtualPlayer') {
                this.sio.sockets.sockets.get(player.idOpponent)?.emit('gameUpdateClient', {
                    game,
                    player: opponent,
                    scoreOpponent: player.score,
                    nbLetterStandOpponent: player.nbLetterStand,
                });
            } else {
                this.sio.sockets.sockets.get(player.idPlayer)?.emit('gameUpdateClient', {
                    game,
                    player,
                    scoreOpponent: opponent.score,
                    nbLetterStandOpponent: opponent.nbLetterStand,
                });
            }
        }
    }

    private triggerStopTimer(player: Player) {
        if (player.idOpponent !== 'virtualPlayer') {
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('stopTimer');
            this.sio.sockets.sockets.get(player.idOpponent)?.emit('stopTimer');
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('displayChangeEndGame', GlobalConstants.END_GAME_DISPLAY_MSG);
            this.sio.sockets.sockets.get(player.idOpponent)?.emit('displayChangeEndGame', GlobalConstants.END_GAME_DISPLAY_MSG);
        } else {
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('stopTimer');
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('displayChangeEndGame', GlobalConstants.END_GAME_DISPLAY_MSG);
        }
    }

    private giveRandomNbOpponent(sizeArrayVPOptions: number): number {
        const returnValue = Math.floor(Math.random() * sizeArrayVPOptions);
        return returnValue;
    }
}
