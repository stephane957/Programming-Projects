/* eslint-disable max-lines*/
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChatMessage } from '@app/classes/chat-message';
import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
import { RoomData } from '@app/classes/room-data';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { DrawingBoardService } from './drawing-board-service';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';
import { NotificationService } from './notification.service';
import { PlaceGraphicService } from './place-graphic.service';
import { RankedService } from './ranked.service';
import { TimerService } from './timer.service';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    socket: Socket;
    gameFinished: BehaviorSubject<boolean>;
    gameId: string = '';
    count: number;
    private urlString = environment.serverUrl;

    constructor(
        private router: Router,
        private infoClientService: InfoClientService,
        private drawingBoardService: DrawingBoardService,
        private timerService: TimerService,
        private rankedService: RankedService,
        private drawingService: DrawingService,
        private placeGraphicService: PlaceGraphicService,
        private notifService: NotificationService,
        private translate: TranslateService,
    ) {
        this.socket = io(this.urlString);
        this.gameFinished = new BehaviorSubject(this.infoClientService.game.gameFinished);
        this.socketListen();
        this.count = 1;
    }

    private socketListen() {
        this.roomManipulationHandler();
        this.otherSocketOn();
        this.gameUpdateHandler();
        this.timerHandler();
        this.canvasActionsHandler();
        this.chatRoomsHandler();
    }

    private canvasActionsHandler() {
        this.socket.on('clearTmpTileCanvas', () => {
            this.drawingBoardService.clearCanvas(this.drawingBoardService.tmpTileCanvas);
        });

        this.socket.on('drawBorderTileForTmpHover', (boardIndexs) => {
            this.drawingBoardService.clearCanvas(this.drawingBoardService.tmpTileCanvas);
            this.drawingBoardService.drawBorderTileForTmpHover(boardIndexs);
        });

        this.socket.on('tileDraggedOnCanvas', (clickedTile, mouseCoords) => {
            this.drawingBoardService.drawTileDraggedOnCanvas(clickedTile, mouseCoords);
        });

        this.socket.on('drawVerticalArrow', (arrowCoords) => {
            this.drawingBoardService.drawVerticalArrowDirection(arrowCoords.x, arrowCoords.y);
        });

        this.socket.on('drawHorizontalArrow', (arrowCoords) => {
            this.drawingBoardService.drawHorizontalArrowDirection(arrowCoords.x, arrowCoords.y);
        });
    }

    private gameUpdateHandler() {
        this.socket.on('playerAndStandUpdate', (player) => {
            // this is a disgusting block fix bug there isn't rly a better way to do it
            // when the modal to choose the letter is open the player shouldn't update or it
            // will refresh the visual in the sidebar component which is not what we want
            if (this.infoClientService.displayExchLetterModal === 'block') {
                return;
            }
            this.infoClientService.player = player;
            setTimeout(() => {
                this.drawingService.reDrawStand(player.stand, this.infoClientService.letterBank);
            }, Constants.WAIT_FOR_CANVAS_INI);
        });

        this.socket.on('gameBoardUpdate', async (game) => {
            this.infoClientService.game = game;
            if (!game.gameFinished) {
                setTimeout(() => {
                    this.drawingBoardService.reDrawBoard(this.socket, game.bonusBoard, game.board, this.infoClientService.letterBank);
                }, Constants.WAIT_FOR_CANVAS_INI);
            }
            if (game.gameFinished && this.count === 1) {
                this.gameFinished.next(true);
                this.count++;
            }
        });

        this.socket.on('savedGameId', (id: string) => {
            this.gameId = id;
        });

        // updates the players and spectators list for each rooms
        this.socket.on('playersSpectatorsUpdate', ({ roomName, players, spectators }) => {
            // gets the room used by the client and stores it for ez access
            const idxExistingRoom = this.infoClientService.rooms.findIndex((element) => element.name === roomName);
            this.infoClientService.actualRoom = this.infoClientService.rooms[idxExistingRoom];
            // update the players and spectators of the room
            this.infoClientService.rooms[idxExistingRoom].players = players;
            if (this.infoClientService.isSpectator) {
                setTimeout(() => {
                    this.drawingService.drawSpectatorStands(players);
                }, Constants.WAIT_FOR_CANVAS_INI);
            }
            this.infoClientService.rooms[idxExistingRoom].spectators = spectators;

            // update the player object locally
            // (this object is here to access easily the player's data)
            const tmpPlayer = this.infoClientService.actualRoom.players?.find((player) => player.name === this.infoClientService.playerName);
            if (tmpPlayer) {
                this.infoClientService.player = tmpPlayer;
            }

            // useful when spectators connect in middle of game
            // update the name of the person playing for the spectator
            // TODO doesn't update the timer for the spectator
            this.updateUiForSpectator(this.infoClientService.game);
            // update display turn to show that we are waiting for creator or other players
            if (!this.infoClientService.game.gameStarted) {
                this.updateUiBeforeStartGame(players);
            }
        });

        this.socket.on('findTileToPlaceArrow', (realPosInBoardPx) => {
            this.drawingBoardService.findTileToPlaceArrow(this.socket, realPosInBoardPx, this.infoClientService.game.board);
        });

        this.socket.on('creatorShouldBeAbleToStartGame', (creatorCanStart) => {
            this.infoClientService.creatorShouldBeAbleToStartGame = creatorCanStart;
        });

        // for now this socket is only used when the player doesn't put a valid word on the board
        // we don't want to explicitly switch the playeer's turn so we control his actions
        // by settings this variable to true (see server side in comm-box service)
        this.socket.on('changeIsTurnOursStatus', (isTurnOurs) => {
            this.infoClientService.isTurnOurs = isTurnOurs;
            this.infoClientService.displayExchLetterModal = 'none';
            this.infoClientService.displayTransformTileModal = 'none';
            this.infoClientService.displayExchStandModal = 'none';
            this.infoClientService.displayPowerModal = 'none';
        });
    }

    private displayChangeEndGameCallBack() {
        this.infoClientService.displayTurn = this.translate.instant('GAME.END_GAME');
    }

    private timerHandler() {
        this.socket.on('displayChangeEndGame', () => this.displayChangeEndGameCallBack());

        this.socket.on('startClearTimer', ({ minutesByTurn, currentNamePlayerPlaying }) => {
            this.infoClientService.powerUsedForTurn = false;
            this.drawingBoardService.lettersDrawn = '';
            if (currentNamePlayerPlaying === this.infoClientService.playerName) {
                this.infoClientService.displayTurn = this.translate.instant('GAME.ITS_YOUR_TURN');
                this.infoClientService.isTurnOurs = true;
            } else {
                const playerPlaying = this.infoClientService.actualRoom.players.find((player) => player.name === currentNamePlayerPlaying);
                this.infoClientService.displayTurn =
                    this.translate.instant('GAME.ITS_THE_TURN_OF') + playerPlaying?.name + this.translate.instant('GAME.TO_PLAY');
                this.infoClientService.isTurnOurs = false;
                this.placeGraphicService.resetVariablePlacement();
            }
            this.timerService.clearTimer();
            this.timerService.startTimer(minutesByTurn);
        });

        this.socket.on('setTimeoutTimerStart', () => {
            this.drawingBoardService.lettersDrawn = '';
            this.setTimeoutForTimer();
        });

        this.socket.on('stopTimer', () => {
            this.drawingBoardService.lettersDrawn = '';
            this.timerService.clearTimer();
        });

        this.socket.on('addSecsToTimer', (secsToAdd) => {
            this.timerService.addSecsToTimer(secsToAdd);
        });

        this.socket.on('askTimerStatus', () => {
            this.socket.emit('timerStatus', this.timerService.secondsValue);
        });
    }

    private roomManipulationHandler() {
        this.socket.on('addElementListRoom', ({ roomName, gameMode, timeTurn, passwd, players, spectators }) => {
            const idxExistingRoom = this.infoClientService.rooms.findIndex((element) => element.name === roomName);
            if (idxExistingRoom === Constants.DEFAULT_VALUE_NUMBER) {
                this.infoClientService.rooms.push(new RoomData(roomName, gameMode, timeTurn, passwd, players, spectators));
            } else {
                this.infoClientService.rooms[idxExistingRoom].players = players;
                this.infoClientService.rooms[idxExistingRoom].spectators = spectators;
            }
        });

        this.socket.on('removeElementListRoom', (roomNameToDelete) => {
            this.infoClientService.rooms = this.infoClientService.rooms.filter((room) => room.name !== roomNameToDelete);
        });

        this.socket.on('roomChangeAccepted', (page) => {
            this.router.navigate([page]);
        });
    }

    private otherSocketOn() {
        this.socket.on('matchFound', () => {
            this.rankedService.matchHasBeenFound();
        });

        this.socket.on('createRankedGame', async (name, creatorName) => {
            const mockDict = {
                title: 'Dictionnaire français par défaut',
                description: 'Ce dictionnaire contient environ trente mille mots français',
            };
            this.socket.emit('dictionarySelected', mockDict);
            this.socket.emit('createRoomAndGame', {
                roomName: name,
                playerName: creatorName,
                timeTurn: 1,
                isBonusRandom: false,
                gameMode: Constants.MODE_RANKED,
                vpLevel: 'beginner',
                isGamePrivate: false,
                passwd: '',
            });
            this.infoClientService.creatorShouldBeAbleToStartGame = false;
            this.rankedService.closeModal();
        });

        this.socket.on('startGame', (roomName) => {
            this.socket.emit('startGame', roomName);
        });

        this.socket.on('joinRankedRoom', (gameName, socketId) => {
            this.socket.emit('joinRoom', gameName, socketId);
            this.socket.emit('spectWantsToBePlayer', gameName, socketId);
        });
        this.socket.on('joinRoom', (gameName, socketId) => {
            this.socket.emit('joinRoom', gameName, socketId);
        });

        this.socket.on('closeModalOnRefuse', () => {
            this.rankedService.closeModal();
        });

        this.socket.on('closeModal', () => {
            this.rankedService.closeModal();
        });

        this.socket.on('messageServer', (message) => {
            this.notifService.openSnackBar(message, false);
        });

        this.socket.on('SendDictionariesToClient', (dictionaries: MockDict[]) => {
            this.infoClientService.dictionaries = dictionaries;
        });

        this.socket.on('ReSendDictionariesToClient', (dictionaries: MockDict[]) => {
            this.infoClientService.dictionaries = dictionaries;
        });

        this.socket.on('SendBeginnerVPNamesToClient', (namesVP: NameVP[]) => {
            this.infoClientService.nameVPBeginner = namesVP;
        });

        this.socket.on('isSpectator', (isSpectator) => {
            this.infoClientService.isSpectator = isSpectator;
        });

        this.socket.on('askForEntrance', (newPlayerName, newPlayerId) => {
            this.infoClientService.incommingPlayer = newPlayerName;
            this.infoClientService.incommingPlayerId = newPlayerId;
        });

        this.socket.on('sendLetterReserve', (letterReserveArr) => {
            this.infoClientService.letterReserve = letterReserveArr;
        });

        this.socket.on('soundPlay', (soundName) => {
            if (this.infoClientService.soundDisabled) {
                return;
            }
            new Audio('./assets/audios/' + soundName).play();
        });
    }

    private chatRoomsHandler() {
        this.socket.on('setChatRoom', (chatRoom) => {
            const idxChatRoom = this.infoClientService.chatRooms.findIndex((room) => room.name === chatRoom.name);
            // variable used to know if we have to refresh the currSelectedChatroom variable for the ngIfs in the html
            let isRefreshNeccecary = false;
            // if the room is already present we delete it to set the newer one
            // it should never happened though
            if (idxChatRoom !== Constants.DEFAULT_VALUE_NUMBER) {
                // checks if the creator has changed
                if (
                    this.infoClientService.currSelectedChatroom.name === this.infoClientService.chatRooms[idxChatRoom].name &&
                    this.infoClientService.currSelectedChatroom.creator !== chatRoom.creator
                ) {
                    isRefreshNeccecary = true;
                }
                this.infoClientService.chatRooms.splice(idxChatRoom, 1);
            }
            // if the room received is general it means we are getting all the room
            // and this is the start of the app
            if (chatRoom.name === 'general') {
                this.infoClientService.chatRooms = [];
            }
            this.infoClientService.chatRooms.push(chatRoom);
            if (isRefreshNeccecary) {
                this.infoClientService.currSelectedChatroom = this.infoClientService.chatRooms[this.infoClientService.chatRooms.length - 1];
                this.notifService.openSnackBar(this.translate.instant('CHAT_ROOMS.NEW_CREATOR') + chatRoom.name, true);
            }

            if (chatRoom.name === 'general') {
                this.infoClientService.currSelectedChatroom = this.infoClientService.chatRooms[this.infoClientService.chatRooms.length - 1];
            }
        });
        this.socket.on('addMsgToChatRoom', (chatRoomName: string, msg: ChatMessage) => {
            const idxChatRoom = this.infoClientService.chatRooms.findIndex((room) => room.name === chatRoomName);
            if (idxChatRoom === Constants.DEFAULT_VALUE_NUMBER) {
                // eslint-disable-next-line no-console
                console.log('error in SocketService:addMsgToChatRoom');
                return;
            }
            this.infoClientService.chatRooms[idxChatRoom].chatHistory.push(msg);
        });

        this.socket.on('rmChatRoom', (chatRoomName) => {
            const idxChatRoom = this.infoClientService.chatRooms.findIndex((room) => room.name === chatRoomName);
            if (idxChatRoom === Constants.DEFAULT_VALUE_NUMBER) {
                // eslint-disable-next-line no-console
                console.log('error in SocketService:rmChatRoom');
                return;
            }
            this.infoClientService.chatRooms.splice(idxChatRoom, 1);
            this.infoClientService.currSelectedChatroom = this.infoClientService.chatRooms[0];
            this.notifService.openSnackBar(
                this.translate.instant('CHAT_ROOMS.ROOM_DEL_1') + chatRoomName + this.translate.instant('CHAT_ROOMS.ROOM_DEL_2'),
                true,
            );
        });

        this.socket.on('sendAvatars', (name, avatar) => {
            this.infoClientService.userAvatars.set(name, avatar);
        });
    }

    private setTimeoutForTimer() {
        const oneSecond = 1000;
        const timerInterval = setInterval(() => {
            if (this.timerService.secondsValue <= 0 && this.infoClientService.game.masterTimer === this.socket.id) {
                this.socket.emit('turnFinished');
            }
            if (this.infoClientService.game.gameFinished) {
                this.placeGraphicService.resetVariablePlacement();
                clearInterval(timerInterval);
            }
        }, oneSecond);
    }

    private updateUiForSpectator(game: GameServer) {
        if (
            !this.infoClientService.isSpectator ||
            !this.infoClientService.game.gameStarted ||
            this.infoClientService.game.gameFinished ||
            game.idxPlayerPlaying < 0
        ) {
            return;
        }

        const playerPlaying = this.infoClientService.actualRoom.players[game.idxPlayerPlaying];
        this.infoClientService.displayTurn =
            this.translate.instant('GAME.ITS_THE_TURN_OF') + playerPlaying?.name + this.translate.instant('GAME.TO_PLAY');
    }

    private updateUiBeforeStartGame(players: Player[]) {
        const nbRealPlayer = players?.filter((player: Player) => player.id !== 'virtualPlayer').length;
        if (nbRealPlayer >= Constants.MIN_PERSON_PLAYING) {
            this.infoClientService.displayTurn = this.translate.instant('GAME.WAITING_FOR_CREATOR');
        } else {
            this.infoClientService.displayTurn = this.translate.instant('GAME.WAIT_FOR_OTHER_PLAYERS');
        }
    }
}
