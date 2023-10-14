/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { io } from 'socket.io-client';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let drawingBoardServiceSpyObj: jasmine.SpyObj<DrawingBoardService>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;
    let mouseKeyboardEventHandlerServiceSpyObj: jasmine.SpyObj<MouseKeyboardEventHandlerService>;
    // let routerSpyObj: jasmine.SpyObj<Router>;
    const urlString = `http://${window.location.hostname}:3000`;

    beforeEach(() => {
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);
        drawingBoardServiceSpyObj = jasmine.createSpyObj('DrawingBoardService', ['']);
        mouseKeyboardEventHandlerServiceSpyObj = jasmine.createSpyObj('MouseKeyboardEventHandlerService', ['onLeftClickGamePage']);
        // let navigationEvent = new NavigationStart(1, "fq");
        // routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'events']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            providers: [
                { provide: MouseKeyboardEventHandlerService, useValue: mouseKeyboardEventHandlerServiceSpyObj },
                { provide: DrawingBoardService, useValue: drawingBoardServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                {
                    provide: Router,
                    useValue: {
                        url: '/game',
                        events: of(1),
                        navigate: (_: string) => {
                            return _;
                        },
                    },
                },
            ],
            declarations: [GamePageComponent],
            // providers: [{ provide: Router, useValue: routerSpyObj }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        // routerSpyObj.events = of(1);
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        socketServiceSpyObj.socket = io(urlString);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onLeftClick should call emit if on stand', () => {
        component.onLeftClickGamePage();
        expect(mouseKeyboardEventHandlerServiceSpyObj.onLeftClickGamePage).toHaveBeenCalled();
    });

    // it('onLeftClick should not call emit if drawingBoardService.lettersDrawn have letter', () => {
    //     drawingBoardServiceSpyObj.lettersDrawn = 'aa';
    //     const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
    //     const eventObj = new MouseEvent('mousedown', { clientX: 300, clientY: 900 });

    //     component.onLeftClick(eventObj);
    //     expect(emitSpy).toHaveBeenCalledTimes(0);
    // });

    // it('onLeftClick should call emit if on stand', () => {
    //     drawingBoardServiceSpyObj.lettersDrawn = '';
    //     const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
    //     const eventObj = new MouseEvent('mousedown', { clientX: 500, clientY: 900 });

    //     component.onLeftClick(eventObj);
    //     expect(emitSpy).toHaveBeenCalled();
    // });
});
