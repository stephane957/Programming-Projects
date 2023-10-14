/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import * as GlobalConstants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { LetterData } from '@app/classes/letter-data';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec4 } from '@app/classes/vec4';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
    const letterBank: Map<string, LetterData> = new Map([
        ['A', { quantity: 9, weight: 1 }],
        ['B', { quantity: 2, weight: 3 }],
        ['C', { quantity: 2, weight: 3 }],
        ['D', { quantity: 3, weight: 2 }],
        ['E', { quantity: 15, weight: 1 }],
        ['F', { quantity: 2, weight: 4 }],
        ['G', { quantity: 2, weight: 2 }],
        ['H', { quantity: 2, weight: 4 }],
        ['I', { quantity: 8, weight: 1 }],
        ['J', { quantity: 1, weight: 8 }],
        ['K', { quantity: 1, weight: 10 }],
        ['L', { quantity: 5, weight: 1 }],
        ['M', { quantity: 3, weight: 2 }],
        ['N', { quantity: 6, weight: 1 }],
        ['O', { quantity: 6, weight: 1 }],
        ['P', { quantity: 2, weight: 3 }],
        ['Q', { quantity: 1, weight: 8 }],
        ['R', { quantity: 6, weight: 1 }],
        ['S', { quantity: 6, weight: 1 }],
        ['T', { quantity: 6, weight: 1 }],
        ['U', { quantity: 6, weight: 1 }],
        ['V', { quantity: 2, weight: 4 }],
        ['W', { quantity: 1, weight: 10 }],
        ['X', { quantity: 1, weight: 10 }],
        ['Y', { quantity: 1, weight: 10 }],
        ['Z', { quantity: 1, weight: 10 }],
        ['*', { quantity: 2, weight: 0 }],
    ]);
    const letterBankOnlyANoWeight: Map<string, LetterData> = new Map([
        ['A', { quantity: 9, weight: 0 }],
    ]);
    const tileStubDefined = {
        letter: {
            value: 'a',
            weight: 1,
        },
        old: false,
        isOnBoard: false,
    } as Tile;

    const tileStubDefinedOld = {
        letter: {
            value: 'a',
            weight: 1,
        },
        old: true,
        isOnBoard: true,
    } as Tile;
    const blankTileStubDefinedOld = {
        letter: {
            value: '*',
            weight: 1,
        },
        old: true,
    } as Tile;

    const tileArr: Tile[] = [];
    beforeEach(async () => {
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['']);
        await TestBed.configureTestingModule({
            providers: [
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        service = TestBed.inject(DrawingService);
        const canvas = CanvasTestHelper.createCanvas(GlobalConstants.DEFAULT_WIDTH_BOARD, GlobalConstants.DEFAULT_HEIGHT_BOARD);
        service.canvasStand = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.canvasStand = canvas.getContext('2d') as CanvasRenderingContext2D;
        tileArr.pop();
        const letterA: Letter = new Letter();
        letterA.value = 'a';
        const tileA: Tile = new Tile();
        const position: Vec4 = new Vec4();
        position.x1 = 0;
        position.y1 = 0;
        position.width = 10;
        position.height = 5;
        tileA.letter = letterA;
        tileA.position = position;
        tileArr.push(tileA);
        infoClientServiceSpyObj.player = new Player('Multi');
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should call beginPath in drawStand with RP', () => {
        const canvasSpy = spyOn(service.canvasStand, 'beginPath').and.stub();
        service['initStand']();
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call fillRect in drawStand with RP', () => {
        const canvasSpy = spyOn(service.canvasStand, 'fillRect').and.stub();
        service['initStand']();
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call strokeRect in drawStand with RP', () => {
        const canvasSpy = spyOn(service.canvasStand, 'strokeRect').and.stub();
        service['initStand']();
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call moveTo in drawStand with RP', () => {
        const canvasSpy = spyOn(service.canvasStand, 'moveTo').and.stub();
        service['initStand']();
        const nbTimeCall = 7;
        expect(canvasSpy).toHaveBeenCalledTimes(nbTimeCall);
    });
    it('should call lineTo in drawStand with RP', () => {
        const canvasSpy = spyOn(service.canvasStand, 'lineTo').and.stub();
        service['initStand']();
        const nbTimeCall = 7;
        expect(canvasSpy).toHaveBeenCalledTimes(nbTimeCall);
    });
    it('should call stroke in drawStand with RP', () => {
        const canvasSpy = spyOn(service.canvasStand, 'stroke').and.stub();
        service['initStand']();
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should change fillStyle in drawStand with RP', () => {
        service['initStand']();
        expect(service.canvasStand.fillStyle).toBe('#beb9a6');
    });
    it('should change lineWidth in drawStand with RP', () => {
        service['initStand']();
        expect(service.canvasStand.lineWidth).toBe(GlobalConstants.WIDTH_LINE_BLOCKS);
    });
    it('should change strokeStyle in drawStand with RP', () => {
        service['initStand']();
        expect(service.canvasStand.strokeStyle).toBe('#aaa38e');
    });

    it('should call beginPath in drawOneLetter', () => {
        const canvasSpy = spyOn(service.canvasStand, 'beginPath').and.stub();
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call fillRect in drawOneLetter', () => {
        const canvasSpy = spyOn(service.canvasStand, 'fillRect').and.stub();
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call roundRect in drawOneLetter', () => {
        const serviceSpy = spyOn<any>(service, 'roundRect').and.stub();
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank);
        expect(serviceSpy).toHaveBeenCalled();
    });
    it('should call checkLetterWeight in drawOneLetter', () => {
        const serviceSpy = spyOn<any>(service, 'roundRect').and.stub();
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank, '#f7f7e3');
        expect(serviceSpy).toHaveBeenCalled();
    });
    it('should call checkLetterWeight in drawOneLetter', () => {
        const serviceSpy = spyOn<any>(service, 'roundRect').and.stub();
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank, '#f7f7e3', '#f7f7e3');
        expect(serviceSpy).toHaveBeenCalled();
    });
    it('should call fillRect in drawOneLetter', () => {
        const canvasSpy = spyOn(service.canvasStand, 'fillRect').and.stub();
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call fillText in drawOneLetter', () => {
        const canvasSpy = spyOn(service.canvasStand, 'fillText').and.stub();
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call fillText in drawOneLetter', () => { //this one
        const canvasSpy = spyOn(service.canvasStand, 'fillText').and.stub();
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBankOnlyANoWeight);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call stroke in drawOneLetter', () => {
        const canvasSpy = spyOn(service.canvasStand, 'stroke').and.stub();
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should change the fillStyle in drawOneLetter', () => {
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank);
        expect(service.canvasStand.fillStyle).toBe('#212121');
    });
    it('should change the fillStyle in drawOneLetter', () => {
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank);
        expect(service.canvasStand.lineWidth).toBe(GlobalConstants.WIDTH_LINE_BLOCKS / 2);
    });
    it('should change the strokeStyle in drawOneLetter', () => {
        service.drawOneLetter('a', tileArr[0], service.canvasStand, letterBank);
        expect(service.canvasStand.strokeStyle).toBe('#54534a');
    });
    it('should call beginPath in removeTile', () => {
        const canvasSpy = spyOn(service.canvasStand, 'beginPath').and.stub();
        service.removeTile(tileArr[0]);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call fillRect in removeTile', () => {
        const canvasSpy = spyOn(service.canvasStand, 'fillRect').and.stub();
        service.removeTile(tileArr[0]);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call stroke in removeTile', () => {
        const canvasSpy = spyOn(service.canvasStand, 'stroke').and.stub();
        service.removeTile(tileArr[0]);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should change the strokeStyle in removeTile', () => {
        service.removeTile(tileArr[0]);
        expect(service.canvasStand.fillStyle).toBe('#beb9a6');
    });

    it('should initialize the canvas to the canvas passed in parameters', () => {
        const canvasTest = CanvasTestHelper.createCanvas(300, GlobalConstants.DEFAULT_HEIGHT_BOARD);
        //drawingservice.boardCanvas = canvas.getContext('2d') as CanvasRenderingContext2D;
        let realCanvasTest = canvasTest.getContext('2d') as CanvasRenderingContext2D;

        service.initStandCanvas(realCanvasTest);
        expect(service.canvasStand).toBe(realCanvasTest);
    });
    it('should change the strokeStyle in removeTile', () => {
        const initStandSpy = spyOn<any>(service, 'initStand').and.stub();
        service.reDrawStand(tileArr, letterBank)
        expect(initStandSpy).toHaveBeenCalled();
    });
    it('should change the strokeStyle in removeTile', () => {
        const drawOneLetterSpy = spyOn(service, 'drawOneLetter').and.stub();
        service.reDrawStand(tileArr, letterBank)
        expect(drawOneLetterSpy).toHaveBeenCalledTimes(1);//only one letter in tileArr
    });
    it('should call draw one letter when resetTileStand is called and there is a tile in the stand', () => {
        const drawOneLetterSpy = spyOn(service, 'drawOneLetter').and.stub();
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefined;
        service.resetColorTileStand(infoClientServiceSpyObj.player, letterBank)
        expect(drawOneLetterSpy).toHaveBeenCalled();//only one letter in tileArr
    });
    it('should call draw one letter when resetTileStand is called and there is a defined tile in the stand', () => {
        const drawOneLetterSpy = spyOn(service, 'drawOneLetter').and.stub();
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = blankTileStubDefinedOld;
        service.resetColorTileStand(infoClientServiceSpyObj.player, letterBank)
        expect(drawOneLetterSpy).toHaveBeenCalled();//only one letter in tileArr
    });
    it('should call draw one letter when resetTileStand is called and there is a tile in the stand and its old', () => {
        const drawOneLetterSpy = spyOn(service, 'drawOneLetter').and.stub();
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefinedOld;
        service.resetColorTileStand(infoClientServiceSpyObj.player, letterBank)
        expect(drawOneLetterSpy).toHaveBeenCalled();//only one letter in tileArr
    });
    it('should call draw one letter when resetTileStand is called and there are multiple tiles in the stand', () => {
        const drawOneLetterSpy = spyOn(service, 'drawOneLetter').and.stub();
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefined;
        infoClientServiceSpyObj.player.stand[1] = tileStubDefined;
        infoClientServiceSpyObj.player.stand[2] = tileStubDefined;
        infoClientServiceSpyObj.player.stand[3] = tileStubDefined;
        infoClientServiceSpyObj.player.stand[4] = tileStubDefined;
        service.resetColorTileStand(infoClientServiceSpyObj.player, letterBank)
        expect(drawOneLetterSpy).toHaveBeenCalledTimes(5);
    });


    it('areLettersRightClicked should return false', () => {
        let returnValue = service.areLettersRightClicked(tileArr);
        expect(returnValue).toBe(false);
    });
    it('areLettersRightClicked should return true', () => {
        tileArr[0].color = '#AEB1D9';
        let returnValue = service.areLettersRightClicked(tileArr);
        expect(returnValue).toBe(true);
    });


});