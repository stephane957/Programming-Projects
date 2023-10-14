/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { Player } from '@app/classes/player';
import { RoomData } from '@app/classes/room-data';
import { SocketMock } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';
import { DrawingBoardService } from './drawing-board-service';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';
import { SocketService } from './socket.service';
import { TimerService } from './timer.service';

describe('SocketService', () => {
    let service: SocketService;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let drawingBoardServiceSpyObj: jasmine.SpyObj<DrawingBoardService>;
    let timerServiceSpyObj: jasmine.SpyObj<TimerService>;

    beforeEach(() => {
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['']);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['reDrawStand', 'initStand', 'resetColorTileStand']);
        drawingBoardServiceSpyObj = jasmine.createSpyObj('DrawingBoardService', ['findTileToPlaceArrow', 'reDrawBoard', 'drawBoardInit'],);
        timerServiceSpyObj = jasmine.createSpyObj('TimerService', ['clearTimer', 'startTimer']);

        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: routerSpyObj },
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: DrawingBoardService, useValue: drawingBoardServiceSpyObj },
                { provide: TimerService, useValue: timerServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        service = TestBed.inject(SocketService);
        const canvas = CanvasTestHelper.createCanvas(GlobalConstants.DEFAULT_WIDTH_BOARD, GlobalConstants.DEFAULT_HEIGHT_BOARD);
        drawingBoardServiceSpyObj.boardCanvas = canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingBoardServiceSpyObj.boardCanvas = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.socket = new SocketMock() as unknown as Socket;
        // service.socket.connect();
        service['socketListen']();

        infoClientServiceSpyObj.player = new Player('MA');
        infoClientServiceSpyObj.game = new GameServer(1, false, GlobalConstants.MODE_SOLO, false);
        infoClientServiceSpyObj.game.bonusBoard = [];
        infoClientServiceSpyObj.game.board = [];
        infoClientServiceSpyObj.dictionaries = new Array<MockDict>();
        infoClientServiceSpyObj.rooms = [];
    });

    // afterEach(() => {
    //     service.socket.close();
    // });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('playerUpdate should call reDrawStand', () => {
        const player = new Player('Adam');
        drawingServiceSpyObj.reDrawStand.and.stub();
        (service.socket as unknown as SocketMock).peerSideEmit('playerUpdate', player);
        expect(drawingServiceSpyObj.reDrawStand).toHaveBeenCalled();
    });

    it('displayChangeEndGame should change infoclientservice displayTurn', () => {
        const mockDisplay = 'mock';
        (service.socket as unknown as SocketMock).peerSideEmit('displayChangeEndGame', mockDisplay);
        expect(infoClientServiceSpyObj.displayTurn).toEqual(mockDisplay);
    });

    it('findTileToPlaceArrow should call drawingBoardService findTileToPlaceArrow', () => {
        const mockPos = { x: 1, y: 1 };
        drawingBoardServiceSpyObj.findTileToPlaceArrow.and.stub();
        (service.socket as unknown as SocketMock).peerSideEmit('findTileToPlaceArrow', mockPos);
        expect(drawingBoardServiceSpyObj.findTileToPlaceArrow).toHaveBeenCalled();
    });

    it('nameOpponentUpdate should update opponentName in infoClientService', () => {
        const mockName = 'Adam';
        (service.socket as unknown as SocketMock).peerSideEmit('nameOpponentUpdate', mockName);
        expect(infoClientServiceSpyObj.nameOpponent).toEqual(mockName);
    });


    it('gameUpdateClient should call drawing and drawingBoard services methods', () => {
        drawingBoardServiceSpyObj.reDrawBoard.and.stub();
        drawingBoardServiceSpyObj.boardCanvas.font = 'bold 11px system-ui';
        drawingServiceSpyObj.reDrawStand.and.stub();
        drawingServiceSpyObj.resetColorTileStand.and.stub();

        (service.socket as unknown as SocketMock).peerSideEmit('gameUpdateClient', {
            game: infoClientServiceSpyObj.game,
            player: infoClientServiceSpyObj.player,
            scoreOpponent: 3,
            nbLetterOnStandOpponent: 7
        });
        expect(drawingServiceSpyObj.reDrawStand).toHaveBeenCalled();
    });

    it('sendStand should call reDrawStand', () => {
        const mockPlayer = new Player('Adam');
        drawingServiceSpyObj.reDrawStand.and.stub();
        (service.socket as unknown as SocketMock).peerSideEmit('sendStand', mockPlayer);
        expect(drawingServiceSpyObj.reDrawStand).toHaveBeenCalled();
    });

    it('startClearTimer should set display turn when not equal', () => {
        let mockMinutesByTurn = 30;
        let mockCurrentPlayerId = 'mockId';
        timerServiceSpyObj.clearTimer.and.stub();
        timerServiceSpyObj.startTimer.and.stub();

        (service.socket as unknown as SocketMock).peerSideEmit('startClearTimer', {
            minutesByTurn: mockMinutesByTurn,
            currentPlayerId: mockCurrentPlayerId
        });
        expect(infoClientServiceSpyObj.displayTurn).toEqual("C'est au tour de votre adversaire !")
    });

    it('startClearTimer should set display turn when equal', () => {
        let mockMinutesByTurn = 30;
        let mockCurrentPlayerId = service.socket.id;
        timerServiceSpyObj.clearTimer.and.stub();
        timerServiceSpyObj.startTimer.and.stub();

        (service.socket as unknown as SocketMock).peerSideEmit('startClearTimer', ({
            minutesByTurn: mockMinutesByTurn,
            currentPlayerId: mockCurrentPlayerId
        }));
        expect(infoClientServiceSpyObj.displayTurn).toEqual("C'est votre tour !")
    });

    it('addElementListRoom should add room if not already added', () => {
        let mockRoom = new RoomData("adam", '00:00', false, false);
        (service.socket as unknown as SocketMock).peerSideEmit('addElementListRoom', mockRoom);
        expect(infoClientServiceSpyObj.rooms.length).toEqual(1);
    });

    it('roomChangeAccepted should change actual room and call navigate', () => {
        let mockActualRoom = 'room1';

        (service.socket as unknown as SocketMock).peerSideEmit('roomChangeAccepted', { roomName: mockActualRoom, page: 'mockPage' });
        expect(routerSpyObj.navigate).toHaveBeenCalled();
        expect(infoClientServiceSpyObj.actualRoom).toEqual(mockActualRoom);
    });

    it('setTimeoutTimerStart should call setTimeoutForTimer', () => {
        const spy = spyOn<any>(service, 'setTimeoutForTimer');
        spy.and.stub();
        (service.socket as unknown as SocketMock).peerSideEmit('setTimeoutTimerStart');
        expect(spy).toHaveBeenCalled();
    });

    it('stopTimer should call clearTimer', () => {
        timerServiceSpyObj.clearTimer.and.stub();
        (service.socket as unknown as SocketMock).peerSideEmit('stopTimer');
        expect(timerServiceSpyObj.clearTimer).toHaveBeenCalled();
    });

    it('removeElementListRoom should not delete given room', () => {
        const mockRoom = new RoomData('adam', '00:00', false, false);

        infoClientServiceSpyObj.rooms = [mockRoom, mockRoom, mockRoom];
        (service.socket as unknown as SocketMock).peerSideEmit('removeElementListRoom', 'mock');
        expect(infoClientServiceSpyObj.rooms.length).toBe(3);
    });

    it('messageServer', () => {
        const alertSpy = spyOn(window, 'alert');
        (service.socket as unknown as SocketMock).peerSideEmit('messageServer', 'message');
        expect(alertSpy).toHaveBeenCalledWith('message');
    });

    it('DictionaryDeletedMessage should alert given message', () => {
        const alertSpy = spyOn(window, 'alert');
        (service.socket as unknown as SocketMock).peerSideEmit('DictionaryDeletedMessage', 'message');
        expect(alertSpy).toHaveBeenCalledWith('message');
    });

    it('SendBeginnerVPNamesToClient should send namesVP to infoclientservice', () => {
        let mockVPNames = [{ lastName: 'Burhan', firstName: 'Adam', protected: true }];

        infoClientServiceSpyObj.nameVPBeginner = [];
        (service.socket as unknown as SocketMock).peerSideEmit('SendBeginnerVPNamesToClient', mockVPNames);
        expect(infoClientServiceSpyObj.nameVPBeginner[0].lastName).toEqual('Burhan');
    });

    it('SendExpertVPNamesToClient should send namesVP to infoclientservice', () => {
        let mockVPNames = [{ lastName: 'Burhan', firstName: 'Adam', protected: true }];

        infoClientServiceSpyObj.nameVPBeginner = [];
        (service.socket as unknown as SocketMock).peerSideEmit('SendExpertVPNamesToClient', mockVPNames);
        expect(infoClientServiceSpyObj.nameVPExpert[0].lastName).toEqual('Burhan');
    });

    it('sendDictionariesToClient', () => {
        let mockDict: MockDict = { title: 'word', description: 'description' };
        (service.socket as unknown as SocketMock).peerSideEmit('SendDictionariesToClient', [mockDict]);
        expect(infoClientServiceSpyObj.dictionaries[0].title).toEqual(mockDict.title);
    });

    it('setTimeoutForTimer', () => {
        const emitSpy = spyOn(service.socket, 'emit');
        timerServiceSpyObj.secondsValue = 0;
        service.socket.id = 'test';
        infoClientServiceSpyObj.game.masterTimer = 'test';
        infoClientServiceSpyObj.game.gameFinished = true;
        jasmine.clock().uninstall();
        jasmine.clock().install();

        service['setTimeoutForTimer']();

        const testVariable = 1050;
        jasmine.clock().tick(testVariable);

        expect(emitSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('gameUpdateStart should init game', (done) => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        let mockRoomName = 'room';

        (service.socket as unknown as SocketMock).peerSideEmit('gameUpdateStart', {
            roomName: mockRoomName,
            game: infoClientServiceSpyObj.game,
            player: infoClientServiceSpyObj.player
        });

        setTimeout(() => {
            expect(drawingServiceSpyObj.reDrawStand).toHaveBeenCalled();
            done();
        }, 10)
    });
});
