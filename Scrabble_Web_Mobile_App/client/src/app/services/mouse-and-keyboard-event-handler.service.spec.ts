/*eslint-disable */
import { TestBed } from '@angular/core/testing';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { SocketService } from '@app/services/socket.service';
import { io } from 'socket.io-client';
import { InfoClientService } from './info-client.service';
import { MouseKeyboardEventHandlerService } from './mouse-and-keyboard-event-handler.service';
import { PlaceGraphicService } from './place-graphic.service';

describe('MouseKeyboardEventHandler', () => {
    let service: MouseKeyboardEventHandlerService;
    let placeGraphicServiceSpyObj: PlaceGraphicService;
    let infoClientServiceSpyObj: InfoClientService;
    let drawingBoardServiceSpyObj: jasmine.SpyObj<DrawingBoardService>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;
    beforeEach(() => {
        drawingBoardServiceSpyObj = jasmine.createSpyObj('DrawingBoardService', ['canvasInit']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['']);
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);
        placeGraphicServiceSpyObj = jasmine.createSpyObj('PlaceGraphicService', [
            'deleteLetterPlacedOnBoard',
            'deleteEveryLetterPlacedOnBoard',
            'manageKeyBoardEvent',
        ]);
        TestBed.configureTestingModule({
            providers: [
                { provide: PlaceGraphicService, useValue: placeGraphicServiceSpyObj },
                { provide: DrawingBoardService, useValue: drawingBoardServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
            ],
        });
        const urlString = `http://${window.location.hostname}:3000`;
        socketServiceSpyObj.socket = io(urlString);
        service = TestBed.inject(MouseKeyboardEventHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onBoardClick should not call emit if lettersDrawn has content in it', () => {
        const eventObj = new MouseEvent('mousewheel', { cancelable: true });
        infoClientServiceSpyObj.player = new Player('Mathis');
        infoClientServiceSpyObj.game = new GameServer(1, false, GlobalConstants.MODE_SOLO, false);
        infoClientServiceSpyObj.game.currentPlayerId = 'id';
        socketServiceSpyObj.socket.id = 'id';
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        service.onBoardClick(eventObj);
        expect(emitSpy).toHaveBeenCalledTimes(0);
    });

    it("onBoardClick should call emit if lettersDrawn doesn't have content in it", () => {
        const eventObj = new MouseEvent('mousewheel', { cancelable: true });
        infoClientServiceSpyObj.player = new Player('Mathis');
        infoClientServiceSpyObj.game = new GameServer(1, false, GlobalConstants.MODE_SOLO, false);
        infoClientServiceSpyObj.game.currentPlayerId = 'id';
        socketServiceSpyObj.socket.id = 'id';
        drawingBoardServiceSpyObj.lettersDrawn = '';
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit').and.stub();
        service.onBoardClick(eventObj);
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });
    it('onLeftClick() should not call emit if lettersDraw is defined', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'abc';
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        infoClientServiceSpyObj.player = new Player('Mathis');
        infoClientServiceSpyObj.game = new GameServer(1, false, GlobalConstants.MODE_SOLO, false);
        infoClientServiceSpyObj.game.currentPlayerId = 'id';

        service.onLeftClickStand(new MouseEvent('click'));
        expect(spyEmit).toHaveBeenCalledTimes(0);
    });

    it("should call emit if lettersDrawn doesn't have content in it", () => {
        const eventObj = new MouseEvent('mousewheel', { cancelable: true });
        infoClientServiceSpyObj.player = new Player('Mathis');
        infoClientServiceSpyObj.game = new GameServer(1, false, GlobalConstants.MODE_SOLO, false);
        infoClientServiceSpyObj.game.currentPlayerId = 'id';
        socketServiceSpyObj.socket.id = 'id';
        drawingBoardServiceSpyObj.lettersDrawn = '';
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit').and.stub();

        service.onLeftClickStand(eventObj);
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });
    it('should call sendMessage if its a simple message', () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit').and.stub();
        service.onCommunicationBoxEnter('asd');
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });
    it('should call sendMessage if its a simple message', () => {
        service.onCommunicationBoxEnter('asd');
        expect(service['isCommBoxJustBeenClicked']).toBe(false);
    });
    it('should call sendMessage if its a simple message', () => {
        service.onCommunicationBoxEnter('asd');
        expect(service.isCommunicationBoxFocus).toBe(true);
    });

    it('should change isCommunicationBoxFocus when onCommunicationBoxLeftClick is called', () => {
        service.onCommunicationBoxLeftClick();
        expect(service.isCommunicationBoxFocus).toBe(true);
    });
    it('should change isCommBoxJustBeenClicked when onCommunicationBoxLeftClick is called', () => {
        service.onCommunicationBoxLeftClick();
        expect(service['isCommBoxJustBeenClicked']).toBe(true);
    });
    it('handleKeyboardEvent shoudl call placerGraphique if an arrow is place', () => {
        const eventObj = new KeyboardEvent('keydown.backspace');
        drawingBoardServiceSpyObj.isArrowPlaced = true;

        service.handleKeyboardEvent(eventObj);
        expect(placeGraphicServiceSpyObj.manageKeyBoardEvent).toHaveBeenCalled();
    });

    it('handleKeyboardEvent shoudl emit', () => {
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        const eventObj = new KeyboardEvent('keydown.backspace');
        service.handleKeyboardEvent(eventObj);
        expect(spyEmit).toHaveBeenCalled();
    });
    it('onBackspaceKeydownHandler shoudl not call emit if the commmunicationBox is focused', () => {
        service.isCommunicationBoxFocus = true;
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        const eventObj = new KeyboardEvent('keydown.backspace');
        service.handleKeyboardEvent(eventObj);
        expect(spyEmit).toHaveBeenCalledTimes(0);
    });

    it('handleKeyboardEvent shoudl emit', () => {
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        const eventObj = new KeyboardEvent('keydown.backspace');
        service.handleKeyboardEvent(eventObj);
        expect(spyEmit).toHaveBeenCalled();
    });

    it('send keyboard letter event should emit', () => {
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        service.handleKeyboardEvent(new KeyboardEvent('keypress'));
        expect(spyEmit).toHaveBeenCalled();
    });

    it('send arrowrightofleft event should emit', () => {
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        const eventObj = new KeyboardEvent('keyup', { cancelable: true, key: 'ArrowRight' });
        service.handleArrowEvent(eventObj);
        expect(spyEmit).toHaveBeenCalled();
    });
    it('onBackspaceKeydownHandler shoudl call handleKeyboardEvent', () => {
        service.isCommunicationBoxFocus = true;
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        const eventObj = new KeyboardEvent('keydown.backspace');
        service.handleArrowEvent(eventObj);
        expect(spyEmit).toHaveBeenCalledTimes(0);
    });

    it('send mouseWhell event should emit keyboardAndMouseManipulation', () => {
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        service.handleScrollEvent(new WheelEvent('mousewheel'));
        expect(spyEmit).toHaveBeenCalled();
    });

    it('send mouseWhell event with comBox Focus should not emit keyboardAndMouseManipulation', () => {
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        service.isCommunicationBoxFocus = true;

        service.handleScrollEvent(new WheelEvent('mousewheel'));
        expect(spyEmit).toHaveBeenCalledTimes(0);
    });

    it('onRightClick() should call mouseService.rightClickExchange', () => {
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');
        service.onRightClickStand(new MouseEvent('contextmenu'));
        expect(spyEmit).toHaveBeenCalled();
    });

    it('onRightClick() should not call emit if lettersDrawn is defined', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'A';
        const spyEmit = spyOn(socketServiceSpyObj.socket, 'emit');

        service.onRightClickStand(new MouseEvent('contextmenu'));
        expect(spyEmit).toHaveBeenCalledTimes(0);
    });
    it('onLeftClickGamePagme should emit', () => {
        drawingBoardServiceSpyObj.lettersDrawn = '';
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        service.onLeftClickGamePage();
        expect(emitSpy).toHaveBeenCalled();
    });
    it('onLeftClickGamePagme should emit', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        service.onLeftClickGamePage();
        expect(emitSpy).toHaveBeenCalledTimes(0);
    });
    it('onLeftClickGamePagme should emit', () => {
        drawingBoardServiceSpyObj.lettersDrawn = '';
        service['isStandClicked'] = true;

        service.onLeftClickGamePage();
        expect(service['isStandClicked']).toBe(false);
    });
});
