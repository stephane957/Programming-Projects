/* eslint-disable max-lines */
import { DictJSON } from '@app/classes/dict-json';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
import { Score } from '@app/classes/score';
import { User } from '@app/classes/user';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
import { CommunicationBoxService } from './communication-box.service';
import { DatabaseService } from './database.service';
import { DictionaryService } from './dictionary.service';
import { MouseEventService } from './mouse-event.service';
import { PlayAreaService } from './play-area.service';
import { PutLogicService } from './put-logic.service';
import { StandService } from './stand.service';

@Service()
export class SocketManager {
    sio: io.Server;
    // Users with <socketId, {nomJoueur, roomName}>
    users: Map<string, User>;

    rooms: Map<string, GameServer>;
    scoreClassic: Score[];
    scoreLOG2990: Score[];

    constructor(
        server: http.Server,
        private mouseEventService: MouseEventService,
        private communicationBoxService: CommunicationBoxService,
        private playAreaService: PlayAreaService,
        private chatService: ChatService,
        private standService: StandService,
        private boardService: BoardService,
        private putLogicService: PutLogicService,
        private databaseService: DatabaseService,
        private dictionaryService: DictionaryService,
    ) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.users = new Map<string, User>();
        this.rooms = new Map<string, GameServer>();
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            this.clientAndRoomHandler(socket);
            // handling event from client
            this.clientEventHandler(socket);
            // handling communicationBoxInput
            this.commBoxInputHandler(socket);
            // handling disconnection and abandonnement
            this.disconnectAbandonHandler(socket);
            // handling dictionnaries, VP names and highscores
            this.adminHandler(socket);
        });
    }

    // The virtual player never calls this function
    private manageNewMessageClient(placeMsg: string, socket: io.Socket) {
        const roomName = this.users.get(socket.id)?.roomName;
        let game;
        let player;
        if (roomName) {
            game = this.rooms.get(roomName);
            player = game?.mapPlayers.get(socket.id);
        }
        if (game && player && roomName) {
            if (!game.gameStarted) {
                player.chatHistory.push({ message: GlobalConstants.GAME_NOT_STARTED, isCommand: false, sender: 'S' });
                socket.emit('playerUpdate', player);
                return;
            }
            const updateOrNot = this.communicationBoxService.onEnter(game, player, placeMsg);
            // If communicationBox doesnt want to update the board we leave the function
            if (!updateOrNot) {
                return;
            }
            const opponent = this.rooms.get(roomName)?.mapPlayers.get(player.idOpponent);
            if (opponent) {
                // We update the chatHistory and the game of each client
                this.triggerGameUpdateClient(socket, player, opponent, game);
                this.triggerStopTimer(socket, player, game, roomName);
            }
        }
    }

    private clientEventHandler(socket: io.Socket) {
        socket.on('turnFinished', () => {
            const user = this.users.get(socket.id);
            const game = user ? this.rooms.get(user.roomName) : undefined;
            const player = game?.mapPlayers.get(socket.id);
            if (game && player) {
                this.chatService.passCommand('!passer', game, player);
                this.playAreaService.changePlayer(game);
            }
        });

        socket.on('boardClick', (coordinateClick) => {
            const roomName = this.users.get(socket.id)?.roomName;

            let player;
            if (roomName) {
                player = this.rooms.get(roomName)?.mapPlayers.get(socket.id);
            }

            if (player) {
                this.mouseEventService.boardClick(player, coordinateClick);
            }
        });

        socket.on('onExchangeClick', () => {
            const roomName = this.users.get(socket.id)?.roomName;
            let player;
            if (roomName) {
                player = this.rooms.get(roomName)?.mapPlayers.get(socket.id);
            }
            const user = this.users.get(socket.id);
            const game = user ? this.rooms.get(user.roomName) : undefined;
            if (game && player) {
                this.mouseEventService.exchangeButtonClicked(game, player);
            }
        });

        socket.on('onAnnulerClick', () => {
            const roomName = this.users.get(socket.id)?.roomName;
            let player;
            if (roomName) {
                player = this.rooms.get(roomName)?.mapPlayers.get(socket.id);
            }
            if (player) {
                this.mouseEventService.cancelButtonClicked(player);
            }
        });

        socket.on('keyboardSelection', (eventString: string) => {
            const roomName = this.users.get(socket.id)?.roomName;
            let player;
            if (roomName) {
                player = this.rooms.get(roomName)?.mapPlayers.get(socket.id);
            }

            if (player) {
                this.mouseEventService.keyboardSelection(player, eventString);
            }
        });

        socket.on('keyboardAndMouseManipulation', (eventString: string) => {
            const roomName = this.users.get(socket.id)?.roomName;
            let player;
            let game;
            if (roomName) {
                player = this.rooms.get(roomName)?.mapPlayers.get(socket.id);
                game = this.rooms.get(roomName);
            }

            if (player && game) {
                this.mouseEventService.keyboardAndMouseManipulation(game, player, eventString);
            }
        });

        socket.on('leftClickSelection', (coordinateXClick) => {
            const roomName = this.users.get(socket.id)?.roomName;
            let player;
            if (roomName) {
                player = this.rooms.get(roomName)?.mapPlayers.get(socket.id);
            }

            if (player) {
                this.mouseEventService.leftClickSelection(player, coordinateXClick);
            }
        });

        socket.on('rightClickExchange', (coordinateXClick) => {
            const roomName = this.users.get(socket.id)?.roomName;
            let player;
            if (roomName) {
                player = this.rooms.get(roomName)?.mapPlayers.get(socket.id);
            }
            if (player) {
                this.mouseEventService.rightClickExchange(player, coordinateXClick);
            }
        });

        socket.on('resetAllTilesStand', () => {
            const roomName = this.users.get(socket.id)?.roomName;
            let player;
            if (roomName) {
                player = this.rooms.get(roomName)?.mapPlayers.get(socket.id);
            }

            if (player) {
                this.mouseEventService.resetAllTilesStand(player);
            }
        });

        socket.on('dbReception', async () => {
            this.scoreClassic = (await this.databaseService.bestScoreClassicCollection.getScoreClassic()) as Score[];
            this.scoreLOG2990 = (await this.databaseService.bestScoreLOG2990Collection.getScoreLOG2990()) as Score[];

            socket.emit('sendScoreDb', this.scoreClassic, this.scoreLOG2990);
        });

        socket.on('dictionarySelected', async (dictionary: MockDict) => {
            this.dictionaryService.gameDictionary = (await this.databaseService.dictionariesCollection.getDictionary(dictionary.title)) as DictJSON;
            const player = this.users.get(socket.id);
            if (player) {
                const game = this.rooms.get(player?.roomName);
                if (game) {
                    this.dictionaryService.createLexicon(game.trie);
                }
            }
        });
    }

    private createGameAndPlayer(
        gameMode: string,
        isLog2990Enabled: boolean,
        timeTurn: number,
        isBonusRandom: boolean,
        playerName: string,
        socket: io.Socket,
        nameOpponent: string,
        roomName: string,
        vpLevel: string,
    ) {
        // We create the game and add it to the rooms map
        const newGame: GameServer = new GameServer(timeTurn, isBonusRandom, gameMode, isLog2990Enabled, vpLevel);
        const newPlayer = new Player(playerName);
        if (isLog2990Enabled) {
            // Gives a private objective to the player
            newGame.setObjectivePlayer(socket.id);
        }
        newPlayer.idPlayer = socket.id;
        this.standService.onInitStandPlayer(newGame.letters, newGame.letterBank, newPlayer);
        this.boardService.initBoardArray(newGame);
        if (gameMode === GlobalConstants.MODE_SOLO) {
            const virtualPlayerId = 'virtualPlayer';
            newPlayer.idOpponent = virtualPlayerId;
            const newOpponent = new Player(nameOpponent);
            if (isLog2990Enabled) {
                // Gives a private objective to the virtualPlayer and sets the rest to public
                newGame.setObjectivePlayer(virtualPlayerId);
            }
            newOpponent.idPlayer = virtualPlayerId;
            newOpponent.idOpponent = socket.id;
            newGame.mapPlayers.set(virtualPlayerId, newOpponent);
            this.standService.onInitStandPlayer(newGame.letters, newGame.letterBank, newOpponent);
        } else {
            // We had a waiting message (while no 2nd player) on chatHistory
            newPlayer?.chatHistory.push({ message: GlobalConstants.WAIT_FOR_SECOND_PLAYER, isCommand: false, sender: 'S' });
        }

        newGame.mapPlayers.set(socket.id, newPlayer);
        this.rooms.set(roomName, newGame);
        // Joining the room
        socket.join(roomName);
        // we send the first client a gameState
        socket.emit('gameUpdateStart', {
            roomName,
            game: newGame,
            player: newPlayer,
        });

        const timeForClientToInitialize = 1000;
        // Since this.socketService.sio doesn't work, we made functions to initialize the sio in other services
        this.putLogicService.initSioPutLogic(this.sio);
        this.mouseEventService.initSioMouseEvent(this.sio);
        this.playAreaService.initSioPlayArea(this.sio);

        setTimeout(() => {
            if (gameMode === GlobalConstants.MODE_SOLO) {
                socket.emit('setTimeoutTimerStart');
                this.playAreaService.playGame(newGame);
            }
        }, timeForClientToInitialize);
    }

    private triggerGameUpdateClient(socket: io.Socket, player: Player, opponent: Player, game: GameServer) {
        socket.emit('gameUpdateClient', {
            game,
            player,
            scoreOpponent: opponent?.score,
            nbLetterStandOpponent: opponent?.nbLetterStand,
        });
        if (player.idOpponent !== 'virtualPlayer') {
            this.sio.sockets.sockets.get(player.idOpponent)?.emit('gameUpdateClient', {
                game,
                player: opponent,
                scoreOpponent: player?.score,
                nbLetterStandOpponent: player?.nbLetterStand,
            });
        }
    }

    private triggerStopTimer(socket: io.Socket, player: Player, game: GameServer, roomName: string) {
        if (!game.gameFinished) {
            return;
        }
        if (player.idOpponent !== 'virtualPlayer') {
            this.sio.to(roomName).emit('stopTimer');
            this.sio.to(roomName).emit('displayChangeEndGame', GlobalConstants.END_GAME_DISPLAY_MSG);
        } else {
            socket.emit('stopTimer');
            socket.emit('displayChangeEndGame', GlobalConstants.END_GAME_DISPLAY_MSG);
        }
    }

    private clientAndRoomHandler(socket: io.Socket) {
        socket.on('new-user', (name) => {
            this.users.set(socket.id, { name, roomName: '' });
        });

        socket.on('createRoomAndGame', ({ roomName, playerName, timeTurn, isBonusRandom, gameMode, isLog2990Enabled, nameOpponent, vpLevel }) => {
            const roomData = this.rooms.get(roomName);
            if (roomData) {
                socket.emit('messageServer', 'Une salle avec ce nom existe déjà.');
                return;
            }
            // We add the roomName to the userMap
            const user = this.users.get(socket.id);
            if (user) {
                user.roomName = roomName;
            }
            this.createGameAndPlayer(gameMode, isLog2990Enabled, timeTurn, isBonusRandom, playerName, socket, nameOpponent, roomName, vpLevel);
            this.sio.sockets.emit('addElementListRoom', {
                roomName,
                timeTurn,
                isBonusRandom,
                isLog2990Enabled,
            });
            // emit to change page on client after verification
            socket.emit('roomChangeAccepted', {
                roomName,
                page: '/game',
            });
        });

        socket.on('joinRoom', ({ roomName, playerId }) => {
            const userData = this.users.get(playerId);
            if (!userData) {
                return;
            }
            if (userData?.roomName === roomName) {
                socket.emit('messageServer', 'Vous êtes déjà dans cette salle !');
                return;
            }

            const game = this.rooms.get(roomName);
            if (game?.mapPlayers.size === GlobalConstants.MAX_PERSON_IN_ROOM) {
                socket.emit('messageServer', 'La salle est complète.');
                return;
            }

            // find the name of the opponent
            let idOpponent = 'DefaultIdNotNormal';
            if (game) {
                for (const key of game.mapPlayers.keys()) {
                    idOpponent = key;
                }
            }

            if (userData?.name === this.users.get(idOpponent)?.name) {
                socket.emit(
                    'messageServer',
                    'Vous avez le même nom que le joueur déjà dans la salle, veuillez le changer en retournant au menu principal.',
                );
                return;
            }
            // We add the roomName to the userMap
            const user = this.users.get(socket.id);
            if (user) {
                user.roomName = roomName;
            }
            // we add the new player to the map of players
            const newPlayer = new Player(userData.name);
            newPlayer.idOpponent = idOpponent;
            newPlayer.idPlayer = socket.id;
            if (game) {
                if (game.isLog2990Enabled) {
                    // Gives a private objective to the player and sets the rest to public
                    game.setObjectivePlayer(socket.id);
                }
                this.standService.onInitStandPlayer(game?.letters, game?.letterBank, newPlayer);
                this.boardService.initBoardArray(game);
            }
            game?.mapPlayers.set(socket.id, newPlayer);
            const opponent = game?.mapPlayers.get(idOpponent);
            // We warn that a new users has arrived
            opponent?.chatHistory.push({ message: userData?.name + ' a rejoint la partie.', isCommand: false, sender: 'S' });
            opponent?.chatHistory.push({ message: 'La partie commence !', isCommand: false, sender: 'S' });
            newPlayer?.chatHistory.push({ message: 'La partie commence !', isCommand: false, sender: 'S' });

            // Joining the room
            socket.join(roomName);

            // We send to the client a gameState and a playerState
            socket.emit('gameUpdateStart', {
                roomName,
                game: this.rooms.get(roomName),
                player: newPlayer,
            });

            // We send the state to the opponent to update chatHistory
            this.sio.sockets.sockets.get(idOpponent)?.emit('playerUpdate', opponent);

            // we send the name of the opponent for the html of the client
            // we also send the new name of the player to the other client
            socket.emit('nameOpponentUpdate', this.users.get(idOpponent)?.name);
            this.sio.sockets.sockets.get(idOpponent)?.emit('nameOpponentUpdate', userData?.name);

            // we set the idOpponent of the new player for the first player
            if (opponent) {
                opponent.idOpponent = socket.id;
            }

            // emit to change page on client after verification
            socket.emit('roomChangeAccepted', {
                roomName,
                page: '/game',
            });
            // usually after a player joins a room the game can start
            if (game) {
                this.putLogicService.initSioPutLogic(this.sio);
                this.playAreaService.initSioPlayArea(this.sio);
                this.mouseEventService.initSioMouseEvent(this.sio);
                this.playAreaService.playGame(game);
                socket.emit('setTimeoutTimerStart');
                this.sio.sockets.sockets.get(idOpponent)?.emit('setTimeoutTimerStart');
            }
            // Remove the room from the view of other players
            this.sio.sockets.emit('removeElementListRoom', roomName);
        });

        socket.on('listRoom', () => {
            for (const roomName of this.rooms.keys()) {
                const roomData = this.rooms.get(roomName);
                if (roomData?.gameFinished) {
                    continue;
                }

                if (roomData && roomData.mapPlayers.size < 2) {
                    socket.emit('addElementListRoom', {
                        roomName,
                        timeTurn: roomData?.minutesByTurn,
                        isBonusRandom: roomData?.randomBonusesOn,
                        isLog2990Enabled: roomData.isLog2990Enabled,
                    });
                }
            }
        });

        socket.on('convertGameInSolo', (nameOpponent, vpLevel) => {
            const user = this.users.get(socket.id);
            if (user) {
                const roomName = user?.roomName;
                const game = this.rooms.get(roomName);
                const player = game?.mapPlayers.get(socket.id);
                if (game && player) {
                    game.gameMode = GlobalConstants.MODE_SOLO;
                    game.vpLevel = vpLevel;
                    // creating new game/room
                    const newRoomName = 'roomOf' + socket.id;
                    user.roomName = newRoomName;
                    this.createGameAndPlayer(
                        game.gameMode,
                        game.isLog2990Enabled,
                        game.minutesByTurn,
                        game.randomBonusesOn,
                        player.name,
                        socket,
                        nameOpponent,
                        newRoomName,
                        game.vpLevel,
                    );

                    // deleting old room
                    this.rooms.delete(roomName);

                    // Remove the room from the view of other players
                    this.sio.sockets.emit('removeElementListRoom', roomName);
                }
            }
        });

        socket.on('leaveGame', () => {
            this.leaveGame(socket);
        });
    }

    private disconnectAbandonHandler(socket: io.Socket) {
        socket.on('disconnect', () => {
            const userData = this.users.get(socket.id);
            if (userData) {
                const game = this.rooms.get(userData.roomName);
                if (game) {
                    if (game.gameFinished) {
                        this.gameFinishedAction(socket, game, userData.roomName);
                        return;
                    }
                    const playerThatLeaves = game.mapPlayers.get(socket.id);
                    const opponent = playerThatLeaves ? game.mapPlayers.get(playerThatLeaves.idOpponent) : undefined;
                    if (playerThatLeaves && opponent) {
                        if (opponent.idOpponent !== 'virtualPlayer') {
                            // we send to the opponent a update of the game
                            const waitBeforeAbandonment = 5000;
                            setTimeout(() => {
                                this.playAreaService.replaceHumanByBot(playerThatLeaves, opponent, game, " s'est déconnecté.");

                                this.sio.sockets.sockets.get(opponent.idPlayer)?.emit('nameOpponentUpdate', playerThatLeaves.name);
                                this.sio.sockets.sockets.get(opponent.idPlayer)?.emit('gameUpdateClient', {
                                    game,
                                    player: opponent,
                                    scoreOpponent: playerThatLeaves?.score,
                                    nbLetterStandOpponent: playerThatLeaves?.nbLetterStand,
                                });
                            }, waitBeforeAbandonment);
                        } else {
                            this.leaveGame(socket);
                        }
                    }
                }
                this.users.delete(socket.id);
            }
        });

        socket.on('giveUpGame', () => {
            const userData = this.users.get(socket.id);
            if (userData) {
                const game = this.rooms.get(userData.roomName);
                if (game) {
                    if (game.gameFinished) {
                        this.gameFinishedAction(socket, game, userData.roomName);
                        return;
                    }
                    const playerThatLeaves = game.mapPlayers.get(socket.id);
                    const opponent = playerThatLeaves ? game.mapPlayers.get(playerThatLeaves.idOpponent) : undefined;
                    if (playerThatLeaves && opponent) {
                        if (opponent.idPlayer !== 'virtualPlayer') {
                            this.playAreaService.replaceHumanByBot(playerThatLeaves, opponent, game, ' a abandonné !');

                            this.sio.sockets.sockets.get(opponent.idPlayer)?.emit('nameOpponentUpdate', playerThatLeaves.name);
                            this.sio.sockets.sockets.get(opponent.idPlayer)?.emit('gameUpdateClient', {
                                game,
                                player: opponent,
                                scoreOpponent: playerThatLeaves?.score,
                                nbLetterStandOpponent: playerThatLeaves?.nbLetterStand,
                            });
                        } else {
                            this.leaveGame(socket);
                        }
                    }
                }
            }
        });
    }

    private leaveGame(socket: io.Socket) {
        const user = this.users.get(socket.id);
        if (user) {
            this.rooms.delete(user.roomName);
            this.sio.sockets.emit('removeElementListRoom', user.roomName);
            user.roomName = '';
        }
    }

    private gameFinishedAction(socket: io.Socket, game: GameServer, roomName: string) {
        const nbPlayerInGame = game.mapPlayers.size;
        if (nbPlayerInGame >= 2) {
            game.mapPlayers.delete(socket.id);
        } else if (nbPlayerInGame <= 1) {
            this.rooms.delete(roomName);
            this.sio.sockets.emit('removeElementListRoom', roomName);
        }
        this.users.delete(socket.id);
    }

    private commBoxInputHandler(socket: io.Socket) {
        socket.on('newMessageClient', (inputClient) => {
            this.manageNewMessageClient(inputClient, socket);
        });
    }

    private adminHandler(socket: io.Socket) {
        socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
        socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);

        socket.on('DictionaryUploaded', async () => {
            await this.databaseService.updateDBDict();
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('DeleteVPName', async (vpName: NameVP) => {
            await this.databaseService.beginnerVPNamesCollections.deleteNameVP(vpName);
            await this.databaseService.updateDBNames();
            socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
        });

        socket.on('DeleteExpertVPName', async (vpName: NameVP) => {
            await this.databaseService.expertVPNamesCollection.deleteNameVP(vpName);
            await this.databaseService.updateDBNames();
            socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);
        });

        socket.on('RefreshBothDbs', async () => {
            await this.databaseService.resetDatabase();
            await this.databaseService.updateDBNames();
            await this.databaseService.updateDBDict();
            socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);
            socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('AddBeginnerNameVP', async (vpName: NameVP) => {
            await this.databaseService.beginnerVPNamesCollections.addNameVP(vpName);
            await this.databaseService.updateDBNames();
            socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
        });

        socket.on('AddExpertNameVP', async (vpName: NameVP) => {
            await this.databaseService.expertVPNamesCollection.addNameVP(vpName);
            await this.databaseService.updateDBNames();
            socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);
        });

        socket.on('deleteSelectedDictionary', async (dictionary: MockDict) => {
            await this.databaseService.dictionariesCollection.deleteDictionary(dictionary.title);
            await this.databaseService.updateDBDict();
            this.sio.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
            const message = 'Le dictionaire ' + dictionary.title + ' a été supprimé !';
            this.sio.emit('DictionaryDeletedMessage', message);
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('EditDictionary', async (dictionary: MockDict, formerTitle: string) => {
            await this.databaseService.dictionariesCollection.modifyDictionary(dictionary, formerTitle);
            await this.databaseService.updateDBDict();
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('AddDictionary', async (dictionary: DictJSON) => {
            await this.databaseService.dictionariesCollection.addDictionary(dictionary);
            await this.databaseService.updateDBDict();
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('EditBeginnerNameVP', async (vpName: NameVP, formerVPName: NameVP) => {
            await this.databaseService.beginnerVPNamesCollections.editNameVP(vpName, formerVPName);
            await this.databaseService.updateDBNames();
            socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
        });

        socket.on('EditExpertNameVP', async (vpName: NameVP, formerVPName: NameVP) => {
            await this.databaseService.expertVPNamesCollection.editNameVP(vpName, formerVPName);
            await this.databaseService.updateDBNames();
            socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);
        });
    }
}
