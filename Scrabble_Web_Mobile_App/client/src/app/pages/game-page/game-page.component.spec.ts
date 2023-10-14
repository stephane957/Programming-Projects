/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationStart, Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { SocketService } from '@app/services/socket.service';
import { Observable, ReplaySubject } from 'rxjs';
import { io } from 'socket.io-client';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let drawingBoardServiceSpyObj: jasmine.SpyObj<DrawingBoardService>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;
    let mouseKeyboardEventHandlerServiceSpyObj: jasmine.SpyObj<MouseKeyboardEventHandlerService>;
    let routerEventRelaySubject: ReplaySubject<RouterEvent>;
    let routerMock: { url: string; events: Observable<RouterEvent>; navigate(): void; };
    const urlString = `http://${window.location.hostname}:3000`;


    beforeEach(() => {
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);
        drawingBoardServiceSpyObj = jasmine.createSpyObj('DrawingBoardService', ['']);
        mouseKeyboardEventHandlerServiceSpyObj = jasmine.createSpyObj('MouseKeyboardEventHandlerService', ['onLeftClickGamePage']);

        routerEventRelaySubject = new ReplaySubject<RouterEvent>(1);
        routerMock = {
            url: '/game',
            events: routerEventRelaySubject.asObservable(),

            navigate() {
                return;
            }
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            providers: [
                { provide: MouseKeyboardEventHandlerService, useValue: mouseKeyboardEventHandlerServiceSpyObj },
                { provide: DrawingBoardService, useValue: drawingBoardServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: Router, useValue: routerMock },
            ],
            declarations: [GamePageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        socketServiceSpyObj.socket = io(urlString);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("new NavigationStart should call router.navigate", () => {
        spyOn(window, 'confirm').and.returnValue(false);
        const navigateSpy = spyOn(routerMock, 'navigate');
        const nagivationStartEvent = new NavigationStart(0, 'http://localhost:4200/home');

        routerEventRelaySubject.next(nagivationStartEvent);
        expect(navigateSpy).toHaveBeenCalled();
    });

    it("new NavigationStart should call socket.emit", () => {
        spyOn(window, 'confirm').and.returnValue(true);
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
        const nagivationStartEvent = new NavigationStart(0, 'http://localhost:4200/home');

        routerEventRelaySubject.next(nagivationStartEvent);
        expect(emitSpy).toHaveBeenCalled();
    });

    it('onLeftClick should call emit if on stand', () => {
        component.onLeftClickGamePage();
        expect(mouseKeyboardEventHandlerServiceSpyObj.onLeftClickGamePage).toHaveBeenCalled();
    });
});
