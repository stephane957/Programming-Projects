/* eslint-disable max-lines */
import { ChatMessage } from '@app/classes/chat-message';
import { DictJSON } from '@app/classes/dict-json';
import { GameSaved } from '@app/classes/game-saved';
import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { ChatRoom } from '@app/classes/interfaces/chatroom.interface';
import { MockDict } from '@app/classes/mock-dict';
import { Player } from '@app/classes/player';
import { Score } from '@app/classes/score';
import { Spectator } from '@app/classes/spectator';
import { Tile } from '@app/classes/tile';
import { User } from '@app/classes/users.interface';
import avatarService from '@app/services/avatar.service';
import { TranslateService } from '@app/services/translate.service';
import UserService from '@app/services/user.service';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
import ChatRoomService from './chatroom.service';
import { CommunicationBoxService } from './communication-box.service';
import { DatabaseService } from './database.service';
import { DictionaryService } from './dictionary.service';
import GameSavedService from './game-saved.service';
import { LetterBankService } from './letter-bank.service';
import { MatchmakingService } from './matchmaking.service';
import { MouseEventService } from './mouse-event.service';
import { PlayAreaService } from './play-area.service';
import { PowerCardsService } from './power-cards.service';
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
    private userService = new UserService();
    private avatarService = new avatarService();
    private gameSavedService = new GameSavedService();

    constructor(
        server: http.Server,
        private mouseEventService: MouseEventService,
        private communicationBoxService: CommunicationBoxService,
        private playAreaService: PlayAreaService,
        private chatService: ChatService,
        private boardService: BoardService,
        private putLogicService: PutLogicService,
        private databaseService: DatabaseService,
        private dictionaryService: DictionaryService,
        private matchmakingService: MatchmakingService,
        private standService: StandService,
        private powerCardsService: PowerCardsService,
        private letterBankService: LetterBankService,
        private chatRoomService: ChatRoomService,
        private translateService: TranslateService,
    ) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.users = new Map<string, User>();
        this.rooms = new Map<string, GameServer>();
        this.matchmakingService.initSioMatchmaking(this.sio);
        this.powerCardsService.initSioPowerCard(this.sio);
        this.chatService.initSioChat(this.sio);
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
            // handling dictionaries, VP names and high scores
            this.adminHandler(socket);
            // handling the ranked/matchmaking events
            this.rankedHandler(socket);
            this.searchHandler(socket);
            this.chatRoomsHandler(socket);

            // joins the general chat room
            socket.join('general' + Constants.CHATROOM_SUFFIX);
        });
    }

    // The virtual player never calls this function
    private async manageNewMessageClient(placeMsg: string, socket: io.Socket): Promise<void> {
        const user = this.users.get(socket.id);
        if (!user) {
            return;
        }
        placeMsg = this.translateService.translateCommandFromPlayer(user.name, placeMsg);
        const game = this.rooms.get(user.roomName);
        if (!game) {
            return;
        }
        const player = game.mapPlayers.get(user.name);
        const spectator = game.mapSpectators.get(socket.id);
        if (!player && !spectator) {
            return;
        }
        if (player) {
            const playerMsgSeparated = placeMsg.split(' ');
            let shouldPlaySound = true;
            // if the command is not a !placer command then there is no sound
            if (playerMsgSeparated[0] !== '!placer') {
                shouldPlaySound = false;
            }
            if ((await this.communicationBoxService.onEnterPlayer(game, player, placeMsg)) && shouldPlaySound) {
                this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('soundPlay', Constants.WORD_VALID_SOUND);
            } else if (shouldPlaySound) {
                this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('soundPlay', Constants.WORD_INVALID_SOUND);
            }
        } else if (spectator) {
            await this.communicationBoxService.onEnterSpectator(game, spectator, placeMsg);
        }

        await this.gameUpdateClients(game);

        if (game.gameFinished) {
            this.triggerStopTimer(game);
        }
        // We update the chatHistory and the game of each client
    }

    private clientEventHandler(socket: io.Socket) {
        socket.on('turnFinished', async () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            const player = game?.mapPlayers.get(user.name);
            if (game && player) {
                await this.chatService.passCommand('!passer', game, player);
                this.playAreaService.changePlayer(game);
            }
        });

        socket.on('boardClick', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.boardClick(player);
            }
        });

        socket.on('onExchangeClick', async () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            const game = this.rooms.get(user.roomName);
            if (game && player) {
                await this.mouseEventService.exchangeButtonClicked(game, player);
            }
        });

        socket.on('onAnnulerClick', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.cancelButtonClicked(player);
            }
        });

        socket.on('keyboardSelection', (eventString: string) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.keyboardSelection(player, eventString);
            }
        });

        socket.on('keyboardAndMouseManipulation', (eventString: string) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);
            const game = this.rooms.get(user.roomName);

            if (player && game) {
                this.mouseEventService.keyboardAndMouseManipulation(game, player, eventString);
            }
        });

        socket.on('leftClickSelection', (coordinateXClick) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.leftClickSelection(player, coordinateXClick);
            }
        });

        socket.on('rightClickExchange', (coordinateXClick) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);
            if (player) {
                this.mouseEventService.rightClickExchange(player, coordinateXClick);
            }
        });

        socket.on('resetAllTilesStand', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.resetAllTilesStand(player);
            }
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

        socket.on('callTestFunction', () => {
            const game = new GameServer(0, Constants.CLASSIC_MODE, 'defaultRoom', false, '');
            this.boardService.initBoardArray(game);
            socket.emit('gameBoardUpdate', game);
            // const gameStub = new GameServer(
            //     1, false,
            //     'null', false,
            //     'expert', 'test', false);
            // const userStub = { name: 'test', roomName: 'test' };
            // this.joinGameAsSpectator(socket, gameStub, userStub);
        });

        socket.on('addTempLetterBoard', async (keyEntered, xIndex, yIndex) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.mouseEventService.addTempLetterBoard(game, keyEntered, xIndex, yIndex);
            // We send to all clients a gameState
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('gameBoardUpdate', game);
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('soundPlay', Constants.LETTER_PLACED_SOUND);
        });

        socket.on('rmTempLetterBoard', async (idxsTileToRm) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.mouseEventService.rmTempLetterBoard(game, idxsTileToRm);
            // We send to all clients a gameState
            await this.gameUpdateClients(game);
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('soundPlay', Constants.LETTER_REMOVED_SOUND);
        });

        socket.on('rmTileFromStand', async (tile: Tile) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.mouseEventService.rmTileFromStand(player, tile);
            await this.gameUpdateClients(game);
        });

        socket.on('addTileToStand', async (letterToAdd) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.mouseEventService.addTileToStand(game, player, letterToAdd);
            await this.gameUpdateClients(game);
        });

        socket.on('onBoardToStandDrop', async (tileDroppedIdxs, letterDropped, standIdx) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('soundPlay', Constants.LETTER_REMOVED_SOUND);
            this.mouseEventService.onBoardToStandDrop(tileDroppedIdxs, letterDropped, standIdx, player, game);
            await this.gameUpdateClients(game);
        });

        socket.on('onBoardToBoardDrop', async (posClickedTileIdxs, posDropBoardIdxs) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.mouseEventService.onBoardToBoardDrop(game, posClickedTileIdxs, posDropBoardIdxs);
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('soundPlay', Constants.LETTER_PLACED_SOUND);
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('gameBoardUpdate', game);
        });

        socket.on('drawBorderTileForTmpHover', (boardIndexs) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('drawBorderTileForTmpHover', boardIndexs);
        });

        socket.on('tileDraggedOnCanvas', (clickedTile, mouseCoords) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('tileDraggedOnCanvas', clickedTile, mouseCoords);
        });

        socket.on('clearTmpTileCanvas', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('clearTmpTileCanvas');
        });

        socket.on('escapeKeyPressed', async (tmpLettersOnBoard) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.boardService.rmTempTiles(game);
            this.standService.putLettersOnStand(game, tmpLettersOnBoard, player);
            // we tell all the client to clear the clearTmpTileCanvas
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('clearTmpTileCanvas', game);
            // we update the board state
            await this.gameUpdateClients(game);
        });

        socket.on('drawVerticalArrow', (arrowCoords) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            // there can never be multiples arrows on the board so we clear
            // the canvas first
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('clearTmpTileCanvas');
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('drawVerticalArrow', arrowCoords);
        });

        socket.on('drawHorizontalArrow', (arrowCoords) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            // there can never be multiples arrows on the board so we clear
            // the canvas first
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('clearTmpTileCanvas');
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('drawHorizontalArrow', arrowCoords);
        });

        socket.on('powerCardClick', async (powerCardName, additionnalParams) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.powerCardsService.powerCardsHandler(game, player, powerCardName, additionnalParams);
            // we update the board state
            await this.gameUpdateClients(game);
        });

        socket.on('requestLetterReserve', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            socket.emit('sendLetterReserve', this.letterBankService.getLettersInReserve(game));
        });

        socket.on('saveGame', async (game: GameSaved) => {
            const savedGame: GameSaved = (await this.gameSavedService.saveGame(game)) as GameSaved;
            this.sio.to(savedGame.roomName + Constants.GAME_SUFFIX).emit('savedGameId', savedGame._id);
        });
    }

    private async createGameAndPlayer(
        gameMode: string,
        timeTurn: number,
        playerName: string,
        socket: io.Socket,
        roomName: string,
        isGamePrivate: boolean,
        passwd: string,
        activatedPowers: boolean[],
    ) {
        // We create the game and add it to the rooms map
        const newGame: GameServer = new GameServer(timeTurn, gameMode, roomName, isGamePrivate, passwd);
        const user = await this.userService.findUserByName(playerName);
        const newPlayer = new Player(playerName, true, user.elo);
        newPlayer.id = socket.id;
        newPlayer.avatarUri = this.userService.getAvatar(await this.userService.findUserByName(playerName));
        this.boardService.initBoardArray(newGame);

        // fill the remaining players with bots
        for (let i = 0; i < Constants.MAX_PERSON_PLAYING - 1; i++) {
            const virtualPlayerId = 'virtualPlayer';
            const newOpponent = new Player(this.databaseService.namesVP[i].firstName + ' ' + this.databaseService.namesVP[i].lastName, false);
            newOpponent.avatarUri = await this.avatarService.getRandomAvatar();
            newOpponent.id = virtualPlayerId;
            newGame.mapPlayers.set(newOpponent.name, newOpponent);
        }

        newGame.mapPlayers.set(newPlayer.name, newPlayer);
        this.rooms.set(roomName, newGame);

        // Joining the room
        socket.join(roomName + Constants.GAME_SUFFIX);

        // activate of desactivate the power cards depending on the settings
        // set by the creator of the game
        if (gameMode === Constants.POWER_CARDS_MODE) {
            this.powerCardsService.initPowerCards(newGame, activatedPowers);
        }

        // Since this.socketService.sio doesn't work, we made functions to initialize the sio in other services
        this.putLogicService.initSioPutLogic(this.sio);
        this.mouseEventService.initSioMouseEvent(this.sio);
        this.playAreaService.initSioPlayArea(this.sio);
        this.matchmakingService.initSioMatchmaking(this.sio);

        // create button for creator to start the game if enough reel player are in the game
        if (gameMode !== Constants.MODE_RANKED) {
            this.shouldCreatorBeAbleToStartGame(newGame);
        }
    }
    private shouldCreatorBeAbleToStartGame(game: GameServer) {
        let creatorCanStart = true;
        if (game.gameStarted || game.gameFinished) {
            creatorCanStart = false;
        } else {
            const nbRealPlayer = Array.from(game.mapPlayers.values()).filter((player) => player.id !== 'virtualPlayer').length;
            if (nbRealPlayer < Constants.MIN_PERSON_PLAYING) {
                creatorCanStart = false;
            }
        }

        for (const player of game.mapPlayers.values()) {
            if (!player.isCreatorOfGame) {
                continue;
            }
            this.sio.sockets.sockets.get(player.id)?.emit('creatorShouldBeAbleToStartGame', creatorCanStart);
            break;
        }
    }

    private async joinGameAsPlayer(socket: io.Socket, game: GameServer, userData: User) {
        // we add the new player to the map of players
        const user = await this.userService.findUserByName(userData.name);
        const newPlayer = new Player(userData.name, false, user.elo);
        game?.mapPlayers.set(socket.id, newPlayer); // dont delete this even if its duplicate code
        newPlayer.avatarUri = this.userService.getAvatar(await this.userService.findUserByName(userData.name));
        newPlayer.id = socket.id;
        game?.mapPlayers.set(socket.id, newPlayer);

        this.playAreaService.sendMsgToAllInRoom(game, userData?.name + ' a rejoint la partie.');
        this.playAreaService.sendMsgToAllInRoom(game, 'La partie commence !');

        // tell the client to his state as a person
        socket.emit('isSpectator', false);
    }

    private joinGameAsSpectator(socket: io.Socket, game: GameServer, userData: User) {
        // we add the new observator to the map of observators
        const newSpectator = new Spectator(userData.name);
        newSpectator.socketId = socket.id;
        game?.mapSpectators.set(socket.id, newSpectator);

        // tell the client to his state as a person
        socket.emit('isSpectator', true);
    }

    private clientAndRoomHandler(socket: io.Socket) {
        socket.on('new-user', async (name) => {
            const user = await this.userService.findUserByName(name);
            if (user.language) {
                this.translateService.addUser(user.name, user.language);
            }
            this.users.set(socket.id, { name, roomName: '', elo: user.elo });
            const avatar = await this.userService.populateAvatarField(user);
            socket.broadcast.emit('sendAvatars', user.name, avatar);
        });

        socket.on('createRoomAndGame', async ({ roomName, playerName, timeTurn, gameMode, isGamePrivate, passwd, activatedPowers }) => {
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
            await this.createGameAndPlayer(gameMode, timeTurn, playerName, socket, roomName, isGamePrivate, passwd, activatedPowers);
            const createdGame = this.rooms.get(roomName);
            if (!createdGame) {
                return;
            }
            createdGame.gameStart = '';

            const players = Array.from(createdGame.mapPlayers.values());
            const spectators = Array.from(createdGame.mapSpectators.values());
            this.sio.sockets.emit('addElementListRoom', {
                roomName,
                gameMode,
                timeTurn,
                passwd,
                players,
                spectators,
            });

            await this.gameUpdateClients(createdGame);

            // emit to change page on client after verification
            socket.emit('roomChangeAccepted', '/game');
        });

        socket.on('joinRoom', async (roomName, playerId) => {
            const userData = this.users.get(playerId);
            if (!userData) {
                return;
            }

            if (userData?.roomName === roomName) {
                socket.emit('roomChangeAccepted', '/game');
                return;
            }

            const game = this.rooms.get(roomName);
            if (!game) {
                return;
            }

            if (game.isGamePrivate) {
                for (const creatorOfGame of game.mapPlayers.values()) {
                    if (creatorOfGame.isCreatorOfGame) {
                        socket.emit('messageServer', this.translateService.translateMessage(userData.name, 'ASK_ENTRANCE_SENT'));
                        this.sio.sockets.sockets.get(creatorOfGame.id)?.emit('askForEntrance', userData.name, playerId);
                        return;
                    }
                }
            }

            await this.joinRoom(socket, userData, game);
        });

        socket.on('timerStatus', (secondsRemaining) => {
            const userData = this.users.get(socket.id);
            if (!userData) {
                return;
            }

            const game = this.rooms.get(userData.roomName);
            if (!game || !game.gameStarted) {
                return;
            }

            const secondsInOneMin = 60;
            this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('startClearTimer', {
                minutesByTurn: secondsRemaining / secondsInOneMin,
                currentNamePlayerPlaying: Array.from(game.mapPlayers.values())[game.idxPlayerPlaying].name,
            });
        });

        socket.on('acceptPlayer', async (isAccepted, newPlayerId) => {
            const userDataPlayerInGame = this.users.get(socket.id);
            if (!userDataPlayerInGame) {
                return;
            }
            const roomName = userDataPlayerInGame.roomName;
            const userDataNewPlayer = this.users.get(newPlayerId);
            if (!userDataNewPlayer) {
                return;
            }

            // if the player is already in a room we do not add him
            if (userDataNewPlayer.roomName !== '') {
                return;
            }

            const game = this.rooms.get(roomName);
            if (!game) {
                return;
            }

            const socketNewPlayer = this.sio.sockets.sockets.get(newPlayerId);
            if (!socketNewPlayer) {
                return;
            }

            if (isAccepted) {
                await this.joinRoom(socketNewPlayer, userDataNewPlayer, game);
            } else {
                userDataNewPlayer.roomName = '';
                this.sio.sockets.sockets.get(newPlayerId)?.emit('messageServer', "Vous n'avez pas été accepté dans la salle.");
            }
        });

        socket.on('listRoom', () => {
            this.sendListOfRooms(socket);
        });

        socket.on('spectWantsToBePlayer', async () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const roomName = user?.roomName;
            const game = this.rooms.get(roomName);
            if (!game) {
                return;
            }
            const spectator = game.mapSpectators.get(socket.id);
            if (!spectator) {
                // enters here for wanting to be spect
                return;
            }
            game.mapSpectators.delete(socket.id);

            let oldVirtualPlayer: Player | undefined;
            // take the first virtualPlayer that the server founds
            for (const player of game.mapPlayers.values()) {
                if (player.id === 'virtualPlayer') {
                    oldVirtualPlayer = player;
                    oldVirtualPlayer.elo = user.elo;
                    break;
                }
            }
            if (!oldVirtualPlayer) {
                // eslint-disable-next-line no-console
                console.log("Error: virtual player not found in 'spectWantsToBePlayer'");
                return;
            }
            const oldVPName = oldVirtualPlayer.name;
            // we get the index of the person leaving to replace him at the same index later
            const idxPlayerLeaving = Array.from(game.mapPlayers.values()).findIndex((player) => player.name === oldVPName);

            // delete the old virtual player from the map
            game.mapPlayers.delete(oldVirtualPlayer.name);

            // set the new player attribute and add it to the map
            oldVirtualPlayer.id = socket.id;
            oldVirtualPlayer.name = user.name;
            oldVirtualPlayer.avatarUri = this.userService.getAvatar(await this.userService.findUserByName(user.name));
            this.playAreaService.insertInMapIndex(idxPlayerLeaving, oldVirtualPlayer.name, oldVirtualPlayer, game.mapPlayers);

            // in some cases if the creator left the game and there was a spectator there
            // would be no creator so when joining the game we asset a new creator
            if (!game.isSomeoneCreator()) {
                game.setNewCreatorOfGame();
            }

            socket.emit('isSpectator', false);

            for (const player of game.mapPlayers.values()) {
                player.chatHistory.push(
                    new ChatMessage(
                        Constants.SYSTEM_SENDER,
                        user.name + this.translateService.translateMessage(player.name, 'REPLACEMENT_BY_PLAYER') + oldVPName + '.',
                    ),
                );
            }

            // sending game info to all client to update nbPlayers and nbSpectators
            // in the room
            this.sio.sockets.emit('addElementListRoom', {
                roomName,
                gameMode: game.gameMode,
                timeTurn: game.minutesByTurn,
                passwd: game.passwd,
                players: Array.from(game.mapPlayers.values()),
                spectators: Array.from(game.mapSpectators.values()),
            });
            await this.gameUpdateClients(game);
            if (game.gameMode !== Constants.MODE_RANKED) {
                this.shouldCreatorBeAbleToStartGame(game);
            }
        });

        // called when the creator of a multiplayer game wants to start the game
        socket.on('startGame', (roomName) => {
            // OLD CODE REPLACED BY THE FACT THAT THE CREATOR OF THE GAME STARTS THE GAME
            const game = this.rooms.get(roomName);
            if (!game) {
                return;
            }
            let display = 'Le ';
            const timestamp = new Date();
            const date = timestamp.toDateString();
            const time = timestamp.toLocaleTimeString();
            display += date;
            display += ' à ';
            display += time;
            game.gameStart = display;

            if (game.mapPlayers.size >= Constants.MIN_PERSON_PLAYING && !game.gameStarted) {
                // we give the server bc we can't include socketManager in those childs
                // but it sucks so... TODO: find a better way to do this
                this.putLogicService.initSioPutLogic(this.sio);
                this.playAreaService.initSioPlayArea(this.sio);
                this.mouseEventService.initSioMouseEvent(this.sio);
                this.matchmakingService.initSioMatchmaking(this.sio);

                // we start the game
                this.playAreaService.playGame(game);
                this.sio.to(roomName + Constants.GAME_SUFFIX).emit('setTimeoutTimerStart');
            }
        });

        socket.on('leaveGame', async () => {
            await this.leaveGame(socket, '');
        });
    }

    private async joinRoom(socket: io.Socket, userData: User, game: GameServer): Promise<void> {
        let isOneNamedSame = false;

        for (const player of game.mapPlayers.values()) {
            if (userData.name === player.name) {
                isOneNamedSame = true;
                break;
            }
        }
        for (const spectator of game.mapSpectators.values()) {
            if (userData.name === spectator.name) {
                isOneNamedSame = true;
                break;
            }
        }

        if (isOneNamedSame) {
            socket.emit(
                'messageServer',
                "Vous avez le même nom qu'un des joueurs déjà dans la salle, veuillez le changer en retournant au menu principal.",
            );
            return;
        }
        if (userData) {
            userData.roomName = game.roomName;
        }

        // Joining the room
        socket.join(game.roomName + Constants.GAME_SUFFIX);

        // if condition respected it means the new user is a player and not a spectator
        // else it is a spectator
        // in this case the new user will ALWAYS ALWAYS join as a spectator bc in this game mode
        // there are virtual players filling the empty slots
        if (game.mapPlayers.size < Constants.MAX_PERSON_PLAYING) {
            this.joinGameAsPlayer(socket, game, userData);
        } else {
            this.joinGameAsSpectator(socket, game, userData);
        }

        // we send the game state to all clients in the room
        await this.gameUpdateClients(game);

        // create button for creator to start the game if enough reel player are in the game
        if (game.gameMode !== Constants.MODE_RANKED) {
            this.shouldCreatorBeAbleToStartGame(game);
        }

        // emit to change page on client after verification
        socket.emit('roomChangeAccepted', '/game');

        // find a socket that is not the socket that just joined the room
        // to ask him the status of the timer in the game
        for (const player of game.mapPlayers.values()) {
            if (player.id !== socket.id && player.id !== 'virtualPlayer') {
                // ask for the timer status
                this.sio.sockets.sockets.get(player.id)?.emit('askTimerStatus');
                break;
            }
        }

        // sending game info to all client to update nbPlayers and nbSpectators
        const players = Array.from(game.mapPlayers.values());
        const spectators = Array.from(game.mapSpectators.values());

        this.sio.sockets.emit('addElementListRoom', {
            roomName: game.roomName,
            gameMode: game.gameMode,
            timeTurn: game.minutesByTurn,
            passwd: game.passwd,
            players,
            spectators,
        });
    }

    // update game for all players in the room
    private async gameUpdateClients(game: GameServer) {
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

    private disconnectAbandonHandler(socket: io.Socket) {
        socket.on('disconnect', async () => {
            await this.leaveGame(socket, " s'est déconnecté.");
            const user = this.users.get(socket.id);
            if (user) {
                this.translateService.deleteUser(user.name);
            }
            this.users.delete(socket.id);
        });

        socket.on('giveUpGame', async () => {
            await this.leaveGame(socket, ' a abandonné la partie.');
        });
    }

    private rankedHandler(socket: io.Socket) {
        socket.on('changeElo', (playerName, elo) => {
            this.userService.changeEloUser(playerName, elo);
        });

        socket.on('leaveRankedGame', (playerName, elo) => {
            const twentyEloDeductedForLeaving = 20;
            elo -= twentyEloDeductedForLeaving;
            this.userService.changeEloUser(playerName, elo);
        });

        socket.on('startMatchmaking', (eloDisparity, user) => {
            this.matchmakingService.findARoomForPlayer(socket, eloDisparity, user);
            // socket.emit('matchFound', player);
        });

        socket.on('refuseMatch', (user) => {
            this.matchmakingService.onRefuse(socket, user);
        });

        socket.on('removePlayerFromGame', (userName) => {
            this.matchmakingService.removePlayerFromGame(socket, userName);
        });

        socket.on('acceptMatch', (user) => {
            this.matchmakingService.onAccept(socket, user);
        });
    }

    private async leaveGame(socket: io.Socket, leaveMsg: string) {
        const user = this.users.get(socket.id);
        if (!user) {
            return;
        }
        const game = this.rooms.get(user.roomName);
        if (!game) {
            return;
        }

        const playerThatLeaves = game.mapPlayers.get(user.name);
        const specThatLeaves = game.mapSpectators.get(socket.id);
        // if it is a spectator that leaves
        if (playerThatLeaves) {
            // if there are only virtualPlayers in the game we delete the game
            const nbRealPlayer = Array.from(game.mapPlayers.values()).filter(
                (player) => player.id !== 'virtualPlayer' && player.id !== playerThatLeaves?.id,
            ).length;
            const nbSpectators = game.mapSpectators.size;

            if ((nbRealPlayer >= 1 || nbSpectators >= 1) && !game.gameFinished) {
                // we send to the opponent a update of the game
                await this.playAreaService.replaceHumanByBot(playerThatLeaves, game, leaveMsg);
                if (socket.id === game.masterTimer) {
                    game.setMasterTimer();
                }
                if (playerThatLeaves.isCreatorOfGame) {
                    playerThatLeaves.isCreatorOfGame = !playerThatLeaves.isCreatorOfGame;
                    game.setNewCreatorOfGame();
                }
                await this.gameUpdateClients(game);

                // if the game hasn't started we check if the button start game should be present
                if (!game.gameStarted) {
                    this.shouldCreatorBeAbleToStartGame(game);
                }
            } else {
                // we remove the player leaving in the map
                game.mapPlayers.delete(playerThatLeaves.name);
            }
        } else if (specThatLeaves) {
            // if it is a spectator that leaves
            game.mapSpectators.delete(socket.id);

            // if spectator was master timer we appoint a new one
            if (socket.id === game.masterTimer) {
                game.setMasterTimer();
            }
        } else {
            // should never go there
            // eslint-disable-next-line no-console
            console.log('Game is broken in socketManager::leaveGame. Good luck to u who got this error :)');
        }

        // we check if we should delete the game or not
        this.gameFinishedAction(game);

        socket.leave(user.roomName + Constants.GAME_SUFFIX);
        user.roomName = '';
        await this.gameUpdateClients(game);
    }
    private gameFinishedAction(game: GameServer) {
        const nbRealPlayer = Array.from(game.mapPlayers.values()).filter((player) => player.id !== 'virtualPlayer').length;
        const nbSpectators = game?.mapSpectators.size;
        // if this is the last player to leave the room we delete it
        if (nbRealPlayer + nbSpectators < 1) {
            this.rooms.delete(game.roomName);
            this.sio.sockets.emit('removeElementListRoom', game.roomName);
        }
    }

    private sendListOfRooms(socket: io.Socket) {
        for (const roomName of this.rooms.keys()) {
            const game = this.rooms.get(roomName);
            if (!game || game?.gameFinished) {
                continue;
            }

            socket.emit('addElementListRoom', {
                roomName,
                gameMode: game.gameMode,
                timeTurn: game.minutesByTurn,
                passwd: game.passwd,
                players: Array.from(game.mapPlayers.values()),
                spectators: Array.from(game.mapSpectators.values()),
            });
        }
    }
    private commBoxInputHandler(socket: io.Socket) {
        socket.on('newMessageClient', async (inputClient) => {
            await this.manageNewMessageClient(inputClient, socket);
        });
    }

    private triggerStopTimer(game: GameServer) {
        this.sio.to(game.roomName + Constants.GAME_SUFFIX).emit('stopTimer');
        for (const player of game.mapPlayers.values()) {
            const endGameMsg = this.translateService.translateMessage(player.name, 'END_GAME_DISPLAY_MSG');
            this.sio.sockets.sockets.get(player.id)?.emit('displayChangeEndGame', endGameMsg);
        }
    }

    private adminHandler(socket: io.Socket) {
        socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);

        socket.on('ReSendDictionariesToClient', () => {
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });
    }

    private searchHandler(socket: io.Socket) {
        const MAX_USERS = 5;
        socket.on('getPlayerNames', async (data) => {
            const usersFound = await this.userService.users
                .find({
                    name: {
                        $regex: data,
                        $options: 'i',
                    },
                })
                .select('name')
                .limit(MAX_USERS);
            socket.emit('getPlayerNames', usersFound);
        });

        socket.on('getChatRoomsNames', async (data) => {
            const roomsFound = await this.chatRoomService.chatRooms
                .find({
                    name: {
                        $regex: data,
                        $options: 'i',
                    },
                })
                .select('name')
                .limit(MAX_USERS);
            socket.emit('getChatRoomsNames', roomsFound);
        });
    }

    private chatRoomsHandler(socket: io.Socket) {
        socket.on('createChatRoom', async (chatRoomName: string) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const dbUser = await this.userService.findUserByName(user.name);
            if (!dbUser || !dbUser.id) {
                return;
            }
            const chatRoom = await this.chatRoomService.createChatRoom(user.name, dbUser.id, chatRoomName, socket);
            // if an error was thrown, the chatRoom name will be ''
            if (chatRoom.name === '') {
                return;
            }
            const chatRoomPopulated = await this.chatRoomService.populateCreatorField(chatRoom);
            socket.emit('setChatRoom', chatRoomPopulated);
        });

        socket.on('deleteChatRoom', async (chatRoomName: string) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const dbUser = await this.userService.findUserByName(user.name);
            if (!dbUser || !dbUser.id) {
                return;
            }
            const chatRoom = await this.chatRoomService.deleteChatRoom(dbUser.id, chatRoomName, socket);
            // if an error was thrown, the chatRoom name will be ''
            if (chatRoom.name === '') {
                return;
            }
            this.sio.to(chatRoomName + Constants.CHATROOM_SUFFIX).emit('rmChatRoom', chatRoomName);
            this.sio.in(chatRoomName + Constants.CHATROOM_SUFFIX).socketsLeave(chatRoomName + Constants.CHATROOM_SUFFIX);
        });

        socket.on('joinChatRoom', async (chatRoomName: string) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const dbUser = await this.userService.findUserByName(user.name);
            if (!dbUser || !dbUser.id) {
                return;
            }
            const chatRoom = await this.chatRoomService.joinChatRoom(dbUser.id, chatRoomName, socket);
            // if an error was thrown, the chatRoom name will be ''
            if (chatRoom.name === '') {
                return;
            }
            const chatRoomPopulated = await this.chatRoomService.populateCreatorField(chatRoom);
            socket.emit('setChatRoom', chatRoomPopulated);
        });

        socket.on('leaveChatRoom', async (chatRoomName: string) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const dbUser = await this.userService.findUserByName(user.name);
            if (!dbUser || !dbUser.id) {
                return;
            }
            await this.chatRoomService.leaveChatRoom(dbUser.id, chatRoomName, socket);
        });

        socket.on('addMsgToChatRoom', async (chatRoomName: string, msg: string) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const dbUser = await this.userService.findUserByName(user.name);
            if (!dbUser || !dbUser.id) {
                return;
            }

            const newMsg = new ChatMessage(user.name, msg);
            await this.chatRoomService.addMsgToChatRoom(dbUser, chatRoomName, msg, newMsg.timestamp, socket);
            // send message to all users in the chat room
            this.sio.to(chatRoomName + Constants.CHATROOM_SUFFIX).emit('addMsgToChatRoom', chatRoomName, newMsg);
        });

        socket.on('getAllChatRooms', async () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const dbUser = await this.userService.findUserByName(user.name);
            if (!dbUser || !dbUser.id) {
                return;
            }
            const chatRooms: ChatRoom[] = await this.chatRoomService.getAllChatRooms(dbUser.id, socket);
            for (const chatRoom of chatRooms) {
                const chatRoomPopulated = await this.chatRoomService.populateCreatorField(chatRoom);
                socket.emit('setChatRoom', chatRoomPopulated);
            }
        });

        socket.on('getChatRoom', async (chatRoomName) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const chatRoom: ChatRoom = await this.chatRoomService.getChatRoom(chatRoomName, socket);
            // if an error was thrown, the chatRoom name will be ''
            if (chatRoom.name === '') {
                return;
            }
            const chatRoomPopulated = await this.chatRoomService.populateCreatorField(chatRoom);
            socket.emit('setChatRoom', chatRoomPopulated);
        });

        // socket user for the search of rooms
        socket.on('getTmpChatRoom', async (chatRoomName) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const chatRoom: ChatRoom = await this.chatRoomService.getChatRoom(chatRoomName, socket);
            // if an error was thrown, the chatRoom name will be ''
            if (chatRoom.name === '') {
                return;
            }
            socket.emit('setTmpChatRoom', chatRoom);
        });

        // socket to change value in map of translateService
        socket.on('changeLanguage', async (playerName, language) => {
            this.translateService.addUser(playerName, language);
        });

        socket.on('getAllAvatars', async () => {
            const avatarUsers: Map<string, string> = new Map();
            const users = await this.userService.findAllUser();
            users.map(async (user) => {
                if (!avatarUsers.has(user.name)) {
                    const avatar = await this.userService.populateAvatarField(user);
                    avatarUsers.set(user.name, avatar);
                    socket.emit('sendAvatars', user.name, avatar);
                }
            });
        });

        socket.on('updatedAvatar', async (username) => {
            const user = await this.userService.findUserByName(username);
            const avatar = await this.userService.populateAvatarField(user);
            socket.broadcast.emit('sendAvatars', user.name, avatar);
        });
    }
}
