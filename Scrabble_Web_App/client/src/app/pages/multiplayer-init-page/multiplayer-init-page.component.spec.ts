/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RoomData } from '@app/classes/room-data';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { io } from 'socket.io-client';
import { MultiplayerInitPageComponent } from './multiplayer-init-page.component';

describe('MultiplayerInitPageComponent', () => {
    let component: MultiplayerInitPageComponent;
    let fixture: ComponentFixture<MultiplayerInitPageComponent>;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;

    const urlString = `http://${window.location.hostname}:3000`;

    beforeEach(() => {
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', [''], { rooms: []});
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);

        TestBed.configureTestingModule({
            declarations: [MultiplayerInitPageComponent],
            providers: [
                { provide: Router, useValue: routerSpyObj },
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        socketServiceSpyObj.socket = io(urlString);
        fixture = TestBed.createComponent(MultiplayerInitPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onClickGame() should call emit', () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component.onClickGame('test');
        expect(emitSpy).toHaveBeenCalled();
    });

    it("onClickRandom() should call socket.emit if keys.length > 0", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
        infoClientServiceSpyObj.rooms = new Array<RoomData>();
        infoClientServiceSpyObj.rooms.push(new RoomData('bonjour', '1', false, false));

        component.onClickRandom();
        expect(emitSpy).toHaveBeenCalled();
    });

    it("onClickRandom() should call alert if keys.length <= 0", () => {
        const alertSpy = spyOn(window, 'alert');
        infoClientServiceSpyObj.rooms = new Array<RoomData>();

        component.onClickRandom();
        expect(alertSpy).toHaveBeenCalled();
    });
});
