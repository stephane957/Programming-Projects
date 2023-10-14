/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { DrawingService } from '@app/services/drawing.service';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { io } from 'socket.io-client';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let drawingBoardServiceSpyObj: jasmine.SpyObj<DrawingBoardService>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;

    const urlString = `http://${window.location.hostname}:3000`;
    const tileStubDefined = {
        letter: {
            value: 't',
            weight: 10,
        },
    } as Tile;

    beforeEach(async () => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['drawOneLetter']);
        drawingBoardServiceSpyObj = jasmine.createSpyObj('DrawingBoardService', ['reDrawBoard', 'reDrawOnlyTilesBoard', 'setMockTiles']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['generateNameOpponent']);
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);

        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: DrawingBoardService, useValue: drawingBoardServiceSpyObj },
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: Router, useValue: routerSpyObj },
            ],
            imports: [
                MatDialogModule,
                BrowserAnimationsModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        infoClientServiceSpyObj.game = new GameServer(1, false, 'Multi', false);
        socketServiceSpyObj.socket = io(urlString);
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('updateSetting() should call reDrawTilesBoard once', () => {
        const eventObj = new MatSliderChange();
        const randomSliderValue = 18;
        eventObj.value = randomSliderValue;
        drawingServiceSpyObj.canvasStand = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        drawingBoardServiceSpyObj.boardCanvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        infoClientServiceSpyObj.game = new GameServer(1, false, 'Multi', false);
        infoClientServiceSpyObj.player = new Player('arthur');
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand.push(tileStubDefined);
        infoClientServiceSpyObj.player.stand.push(tileStubDefined);

        component.updateSetting(eventObj);
        expect(drawingBoardServiceSpyObj.reDrawOnlyTilesBoard).toHaveBeenCalled();
    });

    it('onClickGiveUpButton() should call router.navigate if the game is abandonned', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        component.onClickGiveUpButton();
        expect(routerSpyObj.navigate).toHaveBeenCalled();
    });
    it('finishGameClick() should call router.navigate if the game is finished', () => {
        infoClientServiceSpyObj.game.gameFinished = true;
        component.finishGameClick();
        expect(routerSpyObj.navigate).toHaveBeenCalled();
    });
    it('finishGameClick() should not call router.navigate if the game is not finished', () => {
        infoClientServiceSpyObj.game.gameFinished = false;
        component.finishGameClick();
        expect(routerSpyObj.navigate).toHaveBeenCalledTimes(0);
    });

    it("onClickGiveUpButton() shouldn't call call router.navigate if the game is already finished", () => {
        infoClientServiceSpyObj.game.gameFinished = true;

        component.onClickGiveUpButton();
        expect(routerSpyObj.navigate).toHaveBeenCalledTimes(0);
    });

    it("onClickGiveUpButton() shouldn't call router.navigate if the game is abandonned then canceled", () => {
        spyOn(window, 'confirm').and.returnValue(false);
        component.onClickGiveUpButton();
        expect(routerSpyObj.navigate).toHaveBeenCalledTimes(0);
    });

    it('shouldConvertSoloBe() should return false if game has started', () => {
        infoClientServiceSpyObj.displayTurn = "something";

        const returnValue = component.shouldConvertSoloBe();
        expect(returnValue).toEqual(false);
    });

    it("shouldConvertSoloBe() should return true if game hasn't started", () => {
        infoClientServiceSpyObj.displayTurn = "En attente d'un autre joueur...";

        const returnValue = component.shouldConvertSoloBe();
        expect(returnValue).toEqual(true);
    });

    it("convertGameInSolo() should call emit('convertGameInSolo')", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component.convertGameInSolo('beginner');
        expect(emitSpy).toHaveBeenCalled();
    });

    it("leaveGame() should call emit('leaveGame')", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component.leaveGame();
        expect(emitSpy).toHaveBeenCalled();
    });

    it("openModal() should call modal.open", () => {
        const spyOpen = spyOn(component['modal'], 'open')
            .and
            .returnValue({
                afterClosed: () => of({ data: { lastName: 'test', firstName: 'test' } })
            } as MatDialogRef<typeof component>);

        component.openModal();
        expect(spyOpen).toHaveBeenCalled();
    });
});
