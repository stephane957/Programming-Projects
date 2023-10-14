/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameServer } from '@app/classes/game-server';
import { Objective } from '@app/classes/objective';
import { Player } from '@app/classes/player';
import { InfoClientService } from '@app/services/info-client.service';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';
import { io } from 'socket.io-client';
import { InfoPanelComponent } from './info-panel.component';

describe('InfoPanelComponent', () => {
    let component: InfoPanelComponent;
    let fixture: ComponentFixture<InfoPanelComponent>;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;
    let placeGraphicServiceSpyObj: jasmine.SpyObj<PlaceGraphicService>;

    const urlString = `http://${window.location.hostname}:3000`;

    beforeEach(async () => {
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['']);
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);
        placeGraphicServiceSpyObj = jasmine.createSpyObj('PlaceGraphicService', ['manageKeyBoardEvent']);

        await TestBed.configureTestingModule({
            declarations: [InfoPanelComponent],
            providers: [
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: PlaceGraphicService, useValue: placeGraphicServiceSpyObj },
                { provide: Router, useValue: routerSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        infoClientServiceSpyObj.game = new GameServer(1, false, 'Multi', false);
        infoClientServiceSpyObj.player = new Player('arthur');
        socketServiceSpyObj.socket = io(urlString);

        fixture = TestBed.createComponent(InfoPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onExchangeClick() should call socket.emit', () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
        component.onExchangeClick();
        expect(emitSpy).toHaveBeenCalled();
    });

    it('onCancelClick() should call socket.emit', () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
        component.onCancelClick();
        expect(emitSpy).toHaveBeenCalled();
    });

    it('skipTurnButton() should call socket.emit', () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit'); //
        component.skipTurnButton();
        expect(emitSpy).toHaveBeenCalled();
    });

    it("objectiveClass() should return 'objective failed' if objective is public and failed", () => {
        const objectif1 = new Objective(10, 'egwegwest', 'uncompleted', 1);
        objectif1.playerId = 'public';
        objectif1.failedFor.push(socketServiceSpyObj.socket.id);

        const returnValue = component.objectiveClass(objectif1);
        expect(returnValue).toEqual('objective failed');
    });

    it("objectiveClass() should return 'objective completed' if objective is completed by client", () => {
        const objectif1 = new Objective(10, 'tegwegewwegwegwest', 'completed', 1);
        objectif1.playerId = 'public';
        objectif1.completedBy = socketServiceSpyObj.socket.id;


        const returnValue = component.objectiveClass(objectif1);
        expect(returnValue).toEqual('objective completed');
    });

    it("objectiveClass() should return 'objective failed' if objective is completed but not by the client", () => {
        const objectif1 = new Objective(10, 'tegwegewwegwegwest', 'completed', 1);
        objectif1.playerId = 'public';

        const returnValue = component.objectiveClass(objectif1);
        expect(returnValue).toEqual('objective failed');
    });

    it("objectiveClass() should return 'objective failed' if objective is failed", () => {
        const objectif1 = new Objective(10, 'tegwegewwegwegwest', 'failed', 1);
        objectif1.playerId = 'public';

        const returnValue = component.objectiveClass(objectif1);
        expect(returnValue).toEqual('objective failed');
    });

    it("objectiveClass() should return 'objective uncompleted' if objective is uncompleted", () => {
        const objectif1 = new Objective(10, 'tegwegewwegwegwest', 'uncompleted', 1);
        objectif1.playerId = 'public';

        const returnValue = component.objectiveClass(objectif1);
        expect(returnValue).toEqual('objective uncompleted');
    });
});
