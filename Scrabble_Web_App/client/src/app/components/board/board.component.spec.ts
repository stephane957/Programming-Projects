/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { SocketService } from '@app/services/socket.service';
import { io } from 'socket.io-client';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let drawingBoardServiceSpyObj: jasmine.SpyObj<DrawingBoardService>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
    let mouseKeyboardEventHandlerServiceSpyObj: jasmine.SpyObj<MouseKeyboardEventHandlerService>;

    const urlString = `http://${window.location.hostname}:3000`;

    beforeEach(() => {
        mouseKeyboardEventHandlerServiceSpyObj = jasmine.createSpyObj('MouseKeyboardEventHandlerService', ['onBoardClick']);
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);
        drawingBoardServiceSpyObj = jasmine.createSpyObj('DrawingBoardService', ['canvasInit']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['']);

        TestBed.configureTestingModule({
            declarations: [BoardComponent],
            providers: [
                { provide: MouseKeyboardEventHandlerService, useValue: mouseKeyboardEventHandlerServiceSpyObj },
                { provide: Router, useValue: routerSpyObj },
                { provide: DrawingBoardService, useValue: drawingBoardServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        infoClientServiceSpyObj.game = new GameServer(1, false, GlobalConstants.MODE_SOLO, false);

        socketServiceSpyObj.socket = io(urlString);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onInit', () => {
        component.ngAfterViewInit();
        expect(drawingBoardServiceSpyObj.canvasInit).toHaveBeenCalled();
    });

    it('should not call onBoardClick when you click in the board', () => {
        const eventObj = new MouseEvent('mousewheel', { cancelable: true });
        component.onComponentBoardClick(eventObj);
        expect(mouseKeyboardEventHandlerServiceSpyObj.onBoardClick).toHaveBeenCalled();
    });
});
