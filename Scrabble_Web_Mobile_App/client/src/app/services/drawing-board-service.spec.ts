/*eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import * as GlobalConstants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { LetterData } from '@app/classes/letter-data';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { Vec4 } from '@app/classes/vec4';
import { DrawingBoardService } from './drawing-board-service';
import { DrawingService } from './drawing.service';

describe('DrawingBoardService', () => {
    let service: DrawingBoardService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    const tileArr: Tile[] = [];
    const nbSpikes = 5;
    const tileStubDefined = {
        letter: {
            value: 'a',
            weight: 1,
        },
        position: {
            x1: 1,
            y1: 1,
            width: 1,
            height: 1,
        },
        old: false,
    } as Tile;
    const tileStubDefinedOld = {
        letter: {
            value: 'a',
            weight: 1,
        },
        position: {
            x1: 1,
            y1: 1,
            width: 1,
            height: 1,
        },
        old: true,
    } as Tile;

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
    let mockTiles: string[][];
    beforeEach(async () => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['drawOneLetter']);
        await TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        service = TestBed.inject(DrawingBoardService);
        const canvas = CanvasTestHelper.createCanvas(GlobalConstants.DEFAULT_WIDTH_BOARD, GlobalConstants.DEFAULT_HEIGHT_BOARD);
        service.boardCanvas = canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpyObj.canvasStand = canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpyObj.canvasStand = canvas.getContext('2d') as CanvasRenderingContext2D;
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
        mockTiles = [
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx'],
            ['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx'],
            ['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx'],
            ['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx'],
            ['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx'],
            ['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx'],
            ['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
        ];
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('canvasInit should init the canvas', () => {
        const canvas = CanvasTestHelper.createCanvas(GlobalConstants.DEFAULT_WIDTH_BOARD, GlobalConstants.DEFAULT_HEIGHT_BOARD);
        service.canvasInit(canvas.getContext('2d') as CanvasRenderingContext2D);
        expect(service.boardCanvas).toBeDefined();
    });

    it('should not call drawOneLetter when reDrawTilesBoard is called', () => {
        const board: Tile[][] = [[]];
        for (
            let i = 0, l = GlobalConstants.SIZE_OUTER_BORDER_BOARD - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS;
            i < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2;
            i++, l += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS
        ) {
            board[i] = new Array<Tile>();
            for (
                let j = 0, k = GlobalConstants.SIZE_OUTER_BORDER_BOARD - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS;
                j < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2;
                j++, k += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS
            ) {
                const newTile = new Tile();
                const newPosition = new Vec4();
                const newLetter = new Letter();

                newPosition.x1 = k;
                newPosition.y1 = l;
                newPosition.width = GlobalConstants.WIDTH_EACH_SQUARE;
                newPosition.height = GlobalConstants.WIDTH_EACH_SQUARE;

                newLetter.weight = 0;
                newLetter.value = '';

                newTile.letter = newLetter;
                newTile.position = newPosition;
                newTile.bonus = '2x';

                board[i].push(newTile);
            }
        }
        service.reDrawBoard(mockTiles, board, letterBank);
        expect(drawingServiceSpyObj.drawOneLetter).toHaveBeenCalledTimes(0);
    });
    it('should call drawOneLetter when reDrawTilesBoard is called', () => {
        const board: Tile[][] = [[]];
        for (
            let i = 0, l = GlobalConstants.SIZE_OUTER_BORDER_BOARD - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS;
            i < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2;
            i++, l += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS
        ) {
            board[i] = new Array<Tile>();
            for (
                let j = 0, k = GlobalConstants.SIZE_OUTER_BORDER_BOARD - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS;
                j < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2;
                j++, k += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS
            ) {
                const newTile = new Tile();
                const newPosition = new Vec4();
                const newLetter = new Letter();

                newPosition.x1 = k;
                newPosition.y1 = l;
                newPosition.width = GlobalConstants.WIDTH_EACH_SQUARE;
                newPosition.height = GlobalConstants.WIDTH_EACH_SQUARE;

                newLetter.weight = 0;
                newLetter.value = 'a';

                newTile.letter = newLetter;
                newTile.position = newPosition;
                newTile.bonus = '2x';

                board[i].push(newTile);
            }
        }
        service.reDrawBoard(mockTiles, board, letterBank);
        expect(drawingServiceSpyObj.drawOneLetter).toHaveBeenCalled();
    });
    it('should call beginPath in drawBoardeInit', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'beginPath').and.stub();
        spyOn(service, 'drawTileAtPos').and.returnValue();
        service.drawBoardInit(mockTiles);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call strokeRect in drawBoardInit', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'strokeRect').and.stub();
        service.drawBoardInit(mockTiles);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call fillRect in drawBoardInit', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'fillRect').and.stub();
        service.drawBoardInit(mockTiles);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call fillText in drawBoardInit', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'fillText').and.stub();
        service.drawBoardInit(mockTiles);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call measureText in drawBoardInit', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'measureText').and.callThrough();
        service.drawBoardInit(mockTiles);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call moveTo in drawBoardInit', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'moveTo').and.stub();
        service.drawBoardInit(mockTiles);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call lineTo in drawBoardInit', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'lineTo').and.stub();
        service.drawBoardInit(mockTiles);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call stroke in drawBoardInit', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'stroke').and.stub();
        service.drawBoardInit(mockTiles);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should change font in drawBoardInit', () => {
        service.drawBoardInit(mockTiles);
        expect(service.boardCanvas.font).toBe('19px "bold system-ui"');
    });
    it('should change strokeStyle in drawBoardInit', () => {
        service.drawBoardInit(mockTiles);
        expect(service.boardCanvas.strokeStyle).toBe('#aaa38e');
    });
    it('should call beginPath in drawStar', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'beginPath').and.stub();
        service['drawStar'](0, 0);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call moveTo in drawStar', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'moveTo').and.stub();
        service['drawStar'](0, 0);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call lineTo in drawStar multiple times', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'lineTo').and.stub();
        service['drawStar'](0, 0);
        const nbTimeCall: number = nbSpikes * 2 + 2;
        expect(canvasSpy).toHaveBeenCalledTimes(nbTimeCall);
    });
    it('should call lineTo in drawStar one time', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'lineTo').and.stub();
        service['drawStar'](0, 0);
        const nbTimeCall: number = nbSpikes * 2 + 2;
        expect(canvasSpy).toHaveBeenCalledTimes(nbTimeCall);
    });
    it('should call closePath in drawStar', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'closePath').and.stub();
        service['drawStar'](0, 0);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should call fill in drawStar', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'fill').and.stub();
        service['drawStar'](0, 0);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should return the correct posPxofTile', () => {
        service['startingPosPxOfTile'](1);
        expect(service['startingPosPxOfTile'](1)).toBe((1 + 1) * GlobalConstants.WIDTH_EACH_SQUARE + 1 * GlobalConstants.WIDTH_LINE_BLOCKS);
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'fillRect').and.stub();
        service.drawTileAtPos(1, mockTiles, 1, 5);
        expect(canvasSpy).toHaveBeenCalledOnceWith(88.93333333333334, 88.93333333333334, 40.93333333333333, 40.93333333333333);
    });
    it('should be created', () => {
        const redrawStarSpy = spyOn<any>(service, 'redrawStar').and.stub();
        service.isArrowPlaced = true;
        service.drawTileAtPos(7, mockTiles, 8);
        expect(redrawStarSpy).toHaveBeenCalled();
    });
    it('should be created', () => {
        const redrawStarSpy = spyOn<any>(service, 'redrawStar').and.stub();
        service.isArrowPlaced = true;
        service.drawTileAtPos(16, mockTiles, 8);
        expect(redrawStarSpy).toHaveBeenCalledTimes(0);
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'fillRect').and.stub();
        service['redrawStar'](1, 1, 5);
        expect(canvasSpy).toHaveBeenCalledOnceWith(6, 6, 35.93333333333333, 35.93333333333333);
    });
    it('should be created', () => {
        const drawStarSpy = spyOn<any>(service, 'drawStar').and.stub();
        service['redrawStar'](1, 1, 5);
        expect(drawStarSpy).toHaveBeenCalled();
    });
    it('should be created', () => {
        const drawStarSpy = spyOn<any>(service, 'drawStar').and.stub();
        service['redrawStar'](1, 1);
        expect(drawStarSpy).toHaveBeenCalledTimes(0);
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'beginPath').and.stub();
        service.removeTile(tileStubDefined);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'fillRect').and.stub();
        service.removeTile(tileStubDefined);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'stroke').and.stub();
        service.removeTile(tileStubDefined);
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('should be created', () => {
        service.removeTile(tileStubDefined);
        expect(service.boardCanvas.fillStyle).toBe('#beb9a6');
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'beginPath').and.stub();
        service.drawHorizontalArrowDirection(2, 2);
        expect(canvasSpy).toHaveBeenCalledTimes(1);
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'moveTo').and.stub();
        service.drawHorizontalArrowDirection(2, 2);
        expect(canvasSpy).toHaveBeenCalledTimes(1);
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'lineTo').and.stub();
        service.drawHorizontalArrowDirection(2, 2);
        expect(canvasSpy).toHaveBeenCalledTimes(4);
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'stroke').and.stub();
        service.drawHorizontalArrowDirection(2, 2);
        expect(canvasSpy).toHaveBeenCalledTimes(4);
    });
    it('should be created', () => {
        service.drawHorizontalArrowDirection(2, 2);
        expect(service.arrowPosX).toBe(2);
    });
    it('should change the arrowPosY', () => {
        service.drawHorizontalArrowDirection(2, 2);
        expect(service.arrowPosY).toBe(2);
    });
    it('should call beginPath once', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'beginPath').and.stub();
        service.drawVerticalArrowDirection(2, 2);
        expect(canvasSpy).toHaveBeenCalledTimes(1);
    });
    it('should call moveTo once', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'moveTo').and.stub();
        service.drawVerticalArrowDirection(2, 2);
        expect(canvasSpy).toHaveBeenCalledTimes(1);
    });
    it('should call lineTo 4 times', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'lineTo').and.stub();
        service.drawVerticalArrowDirection(2, 2);
        expect(canvasSpy).toHaveBeenCalledTimes(4);
    });
    it('should be created', () => {
        const canvasSpy = spyOn(service.boardCanvas, 'stroke').and.stub();
        service.drawVerticalArrowDirection(2, 2);
        expect(canvasSpy).toHaveBeenCalledTimes(4);
    });
    it('should change the arrowPosX', () => {
        service.drawVerticalArrowDirection(2, 2);
        expect(service.arrowPosX).toBe(2);
    });
    it('should change the arrowPosY', () => {
        service.drawVerticalArrowDirection(2, 2);
        expect(service.arrowPosY).toBe(2);
    });
    it('should change the canvas fillStyle', () => {
        service['getFillTileColor'](1, 1, mockTiles);
        expect(service.boardCanvas.fillStyle).toBe('#f75d59');
    });
    it('should be created', () => {
        service['getFillTileColor'](1, 2, mockTiles);
        expect(service.boardCanvas.fillStyle).toBe('#beb9a6');
    });
    it('should be created', () => {
        const board: Tile[][] = [[]];
        for (
            let i = 0, l = GlobalConstants.SIZE_OUTER_BORDER_BOARD - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS;
            i < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2;
            i++, l += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS
        ) {
            board[i] = new Array<Tile>();
            for (
                let j = 0, k = GlobalConstants.SIZE_OUTER_BORDER_BOARD - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS;
                j < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2;
                j++, k += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS
            ) {
                const newTile = new Tile();
                const newPosition = new Vec4();
                const newLetter = new Letter();

                newPosition.x1 = k;
                newPosition.y1 = l;
                newPosition.width = GlobalConstants.WIDTH_EACH_SQUARE;
                newPosition.height = GlobalConstants.WIDTH_EACH_SQUARE;

                newLetter.weight = 0;
                newLetter.value = 'a';

                newTile.letter = newLetter;
                newTile.position = newPosition;
                newTile.bonus = '2x';

                board[i].push(newTile);
            }
        }
        service.reDrawOnlyTilesBoard(board, letterBank);
        expect(drawingServiceSpyObj.drawOneLetter).toHaveBeenCalled();
    });
    it('height should return the width of the canvas', () => {
        const position: Vec2 = { x: 1, y: 1 };
        const board = new Array<Tile[]>();
        board[1] = new Array<Tile>();
        board[1][1] = tileStubDefinedOld;
        const drawHorizontalArrowDirectionSpy = spyOn(service, 'drawHorizontalArrowDirection').and.stub();

        service.findTileToPlaceArrow(position, board, mockTiles);
        expect(drawHorizontalArrowDirectionSpy).toHaveBeenCalledTimes(0);
    });
    it('findTileToPlaceArrow() should call drawHorizontalArrowDirection once', () => {
        const position: Vec2 = { x: 1, y: 1 };
        const board = new Array<Tile[]>();
        board[0] = new Array<Tile>();
        board[0][0] = tileStubDefined;

        board[1] = new Array<Tile>();
        board[1][1] = tileStubDefined;
        spyOn(service as any, 'drawTileAtPos').and.stub();
        const drawHorizontalArrowDirectionSpy = spyOn(service, 'drawHorizontalArrowDirection').and.stub();

        service.findTileToPlaceArrow(position, board, mockTiles);
        expect(drawHorizontalArrowDirectionSpy).toHaveBeenCalledTimes(1);
    });
    it('height should return the width of the canvas', () => {
        const position: Vec2 = { x: 1, y: 1 };
        const board = new Array<Tile[]>();
        service.arrowPosX = 1;
        service.arrowPosY = 1;
        board[1] = new Array<Tile>();
        board[1][1] = tileStubDefined;
        spyOn(service, 'drawTileAtPos').and.stub();

        service.findTileToPlaceArrow(position, board, mockTiles);
        expect(service.drawTileAtPos).toHaveBeenCalledTimes(1);
    });
    it('height should return the width of the canvas', () => {
        const position: Vec2 = { x: 1, y: 1 };

        service.isArrowVertical = false;
        const board = new Array<Tile[]>();
        service.arrowPosX = 1;
        service.arrowPosY = 1;
        board[1] = new Array<Tile>();
        board[1][1] = tileStubDefined;
        const drawHorizontalArrowDirectionSpy = spyOn(service, 'drawVerticalArrowDirection').and.stub();

        service.findTileToPlaceArrow(position, board, mockTiles);
        expect(drawHorizontalArrowDirectionSpy).toHaveBeenCalledTimes(1);
    });
    it('height should return the width of the canvas', () => {
        const position: Vec2 = { x: 1, y: 1 };
        const board = new Array<Tile[]>();
        service.lettersDrawn = '';
        service.arrowPosX = 1;
        service.arrowPosY = 1;
        board[1] = new Array<Tile>();
        board[1][1] = tileStubDefined;
        const drawTileAtPosSpy = spyOn(service, 'drawTileAtPos').and.stub();
        service.findTileToPlaceArrow(position, board, mockTiles);
        expect(drawTileAtPosSpy).toHaveBeenCalledTimes(1);
    });
    it('height should return the width of the canvas', () => {
        const position: Vec2 = { x: 1, y: 1 };
        const board = new Array<Tile[]>();
        service.lettersDrawn = 'a';
        service.arrowPosX = 1;
        service.arrowPosY = 1;
        board[1] = new Array<Tile>();
        board[1][1] = tileStubDefined;
        const drawTileAtPosSpy = spyOn(service, 'drawTileAtPos').and.stub();
        service.findTileToPlaceArrow(position, board, mockTiles);
        expect(drawTileAtPosSpy).toHaveBeenCalledTimes(0);
    });
});
