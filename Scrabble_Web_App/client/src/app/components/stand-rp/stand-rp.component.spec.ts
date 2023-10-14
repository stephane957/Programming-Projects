/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player } from '@app/classes/player';
import { StandRPComponent } from '@app/components/stand-rp/stand-rp.component';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { DrawingService } from '@app/services/drawing.service';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';
import { io } from 'socket.io-client';

describe('StandComponent', () => {
    let component: StandRPComponent;
    let fixture: ComponentFixture<StandRPComponent>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let drawingBoardServiceSpyObj: jasmine.SpyObj<DrawingBoardService>;
    let placeGraphicServiceSpyObj: jasmine.SpyObj<PlaceGraphicService>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
    let mouseKeyboardEventHandlerServiceSpyObj: jasmine.SpyObj<MouseKeyboardEventHandlerService>;

    beforeEach(async () => {
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);
        mouseKeyboardEventHandlerServiceSpyObj = jasmine.createSpyObj('MouseKeyboardEventHandlerService', [
            'handleKeyboardEvent',
            'onLeftClickStand',
            'onRightClickStand',
            'handleArrowEvent',
            'handleScrollEvent',
        ]);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['initStand', 'initStandCanvas']);
        placeGraphicServiceSpyObj = jasmine.createSpyObj('PlaceGraphicService', ['manageKeyBoardEvent', 'deleteEveryLetterPlacedOnBoard']);
        drawingBoardServiceSpyObj = jasmine.createSpyObj('DrawingBoardService', ['']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['']);

        await TestBed.configureTestingModule({
            declarations: [StandRPComponent],
            providers: [
                { provide: MouseKeyboardEventHandlerService, useValue: mouseKeyboardEventHandlerServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: PlaceGraphicService, useValue: placeGraphicServiceSpyObj },
                { provide: DrawingBoardService, useValue: drawingBoardServiceSpyObj },
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        const urlString = `http://${window.location.hostname}:3000`;
        socketServiceSpyObj.socket = io(urlString);
        fixture = TestBed.createComponent(StandRPComponent);
        component = fixture.componentInstance;
        // input = fixture.debugElement.query(By.directive(StandRPComponent));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('handleKeyboardEvent shoudl call placerGraphique if an arrow is place', () => {
        // const spyHandleKeyboardEvent = spyOn(mouseKeyboardEventHandlerServiceSpyObj, 'handleKeyboardEvent');
        const eventObj = new KeyboardEvent('keydown.backspace');
        drawingBoardServiceSpyObj.isArrowPlaced = true;

        component.handleKeyboardEvent(eventObj);
        expect(mouseKeyboardEventHandlerServiceSpyObj.handleKeyboardEvent).toHaveBeenCalled();
    });

    it('onBackspaceKeydownHandler shoudl call handleKeyboardEvent', () => {
        // const spyHandleKeyboardEvent = spyOn(mouseKeyboardEventHandlerServiceSpyObj, 'handleKeyboardEvent');
        const eventObj = new KeyboardEvent('keydown.backspace');
        component.onBackspaceKeydownHandler(eventObj);
        expect(mouseKeyboardEventHandlerServiceSpyObj.handleKeyboardEvent).toHaveBeenCalled();
    });
    it('onBackspaceKeydownHandler shoudl call handleKeyboardEvent', () => {
        // const spyHandleKeyboardEvent = spyOn(mouseKeyboardEventHandlerServiceSpyObj, 'handleKeyboardEvent');
        const eventObj = new KeyboardEvent('keyup', { cancelable: true, key: 'ArrowRight' });
        component.handleArrowEvent(eventObj);
        expect(mouseKeyboardEventHandlerServiceSpyObj.handleArrowEvent).toHaveBeenCalled();
    });
    it('onBackspaceKeydownHandler shoudl call handleKeyboardEvent', () => {
        // const spyHandleKeyboardEvent = spyOn(mouseKeyboardEventHandlerServiceSpyObj, 'handleKeyboardEvent');
        const eventObj = new WheelEvent('mousewheel');
        component.handleScrollEvent(eventObj);
        expect(mouseKeyboardEventHandlerServiceSpyObj.handleScrollEvent).toHaveBeenCalled();
    });

    it('onEscapeKeydownHandler shoudl call handleKeyboardEvent', () => {
        // const spyHandleKeyboardEvent = spyOn(mouseKeyboardEventHandlerServiceSpyObj, 'handleKeyboardEvent');
        const eventObj = new KeyboardEvent('keydown.backspace');
        component.onEscapeKeydownHandler(eventObj);
        expect(mouseKeyboardEventHandlerServiceSpyObj.handleKeyboardEvent).toHaveBeenCalled();
    });
    it('onLeftClick() should call emit twice if lettersDraw is defined', () => {
        // drawingBoardServiceSpyObj.lettersDrawn = 'A';
        // const spyonLeftClickStand = spyOn(mouseKeyboardEventHandlerServiceSpyObj, 'onLeftClickStand');
        infoClientServiceSpyObj.player = new Player('Mathis');

        component.onLeftClickStand(new MouseEvent('click'));
        expect(mouseKeyboardEventHandlerServiceSpyObj.onLeftClickStand).toHaveBeenCalledTimes(1);
    });

    it('onRightClick() should call mouseService.rightClickExchange', () => {
        // const spyonRightClickStand = spyOn(mouseKeyboardEventHandlerServiceSpyObj, 'onRightClickStand');
        component.onRightClickStand(new MouseEvent('contextmenu'));
        expect(mouseKeyboardEventHandlerServiceSpyObj.onRightClickStand).toHaveBeenCalled();
    });

    it('should call onInit', () => {
        component.ngAfterViewInit();
        expect(drawingServiceSpyObj.initStandCanvas).toHaveBeenCalled();
    });
});
