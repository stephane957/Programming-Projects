/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as GlobalConstants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { io } from 'socket.io-client';
import { ParametresSelectionPageComponent } from './parametres-selection-page.component';

describe('ParametresSelectionPageComponent', () => {
    let component: ParametresSelectionPageComponent;
    let fixture: ComponentFixture<ParametresSelectionPageComponent>;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let drawingBoardServiceSpyObj: jasmine.SpyObj<DrawingBoardService>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;

    const timeIntervalAvailable: string[] = [
        '30 sec',
        '1 min',
        '1min 30sec',
        '2 min',
        '2min 30sec',
        '3 min',
        '3min 30sec',
        '4 min',
        '4min 30sec',
        '5 min',
    ];

    const stubElement = {
        value: 'test',
    } as HTMLInputElement;

    beforeEach(() => {
        drawingBoardServiceSpyObj = jasmine.createSpyObj('DrawingBoardService', ['randomizeBonuses']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['generateNameOpponent']);
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [ParametresSelectionPageComponent],
            providers: [
                { provide: DrawingBoardService, useValue: drawingBoardServiceSpyObj },
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: Router, useValue: routerSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        const urlString = `http://${window.location.hostname}:3000`;
        socketServiceSpyObj.socket = io(urlString);
        socketServiceSpyObj.socket.id = 'Arthur';
        fixture = TestBed.createComponent(ParametresSelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it("onClickDict() should set this.mockDictionary to the dictionary given in parameter", () => {
        const dictionaryTest: MockDict = { description: "desTest", title: "titleTest" }

        component.onClickDict(dictionaryTest);
        expect(component.mockDictionary).toEqual(dictionaryTest);
    });

    it("vpLevelSelection() should set this.infoClientService.vpLevel to the level given in parameter", () => {
        const levelTest = 'levelTest';

        component.vpLevelSelection(levelTest);
        expect(infoClientServiceSpyObj.vpLevel).toEqual(levelTest);
    });


    it("createRoom should call socket.emit() if gameMode === 'Multi'", () => {
        spyOn(document, 'getElementById').and.returnValue(stubElement);
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
        infoClientServiceSpyObj.gameMode = 'Multi';
        component.createRoom();
        expect(emitSpy).toHaveBeenCalled();
    });

    it('createRoom should call socket.emit() if gameMode === GlobalConstants.MODE_SOLO', () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
        infoClientServiceSpyObj.gameMode = GlobalConstants.MODE_SOLO;
        component.createRoom();
        expect(emitSpy).toHaveBeenCalled();
    });

    it('onClick should call playAreaServicetimeSelection function', () => {
        const spyTimeSelection = spyOn<any>(component, 'timeSelection');
        component.onClickTime('5 min');
        expect(spyTimeSelection).toHaveBeenCalled();
    });

    it('randomizeBonuses should call drawingBoardService.randomizeBonuses function', () => {
        infoClientServiceSpyObj.randomBonusesOn = true;
        const oldRandomBonuses = infoClientServiceSpyObj.randomBonusesOn;
        component.randomizeBonuses();
        expect(oldRandomBonuses).toEqual(!infoClientServiceSpyObj.randomBonusesOn);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 0.5;
        component['timeSelection'](timeIntervalAvailable[0]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 1;
        component['timeSelection'](timeIntervalAvailable[1]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 1.5;
        component['timeSelection'](timeIntervalAvailable[2]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 2;
        component['timeSelection'](timeIntervalAvailable[3]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 2.5;
        component['timeSelection'](timeIntervalAvailable[4]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 3;
        component['timeSelection'](timeIntervalAvailable[5]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 3.5;
        component['timeSelection'](timeIntervalAvailable[6]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 4;
        component['timeSelection'](timeIntervalAvailable[7]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 4.5;
        component['timeSelection'](timeIntervalAvailable[8]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });

    it('time selection should set the correct time interval between turns', () => {
        const testValue = 5;
        component['timeSelection'](timeIntervalAvailable[9]);
        expect(infoClientServiceSpyObj.minutesByTurn).toBe(testValue);
    });
});
