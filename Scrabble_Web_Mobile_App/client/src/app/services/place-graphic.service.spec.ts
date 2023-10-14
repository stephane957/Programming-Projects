/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec4 } from '@app/classes/vec4';
import { InfoClientService } from '@app/services/info-client.service';
import { DrawingBoardService } from './drawing-board-service';
import { DrawingService } from './drawing.service';
import { PlaceGraphicService } from './place-graphic.service';

describe('PlaceGraphicService', () => {
    let service: PlaceGraphicService;
    let drawingBoardServiceSpyObj: jasmine.SpyObj<DrawingBoardService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
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

    beforeEach(() => {
        drawingBoardServiceSpyObj = jasmine.createSpyObj('DrawingBoardService', [
            'removeTile',
            'drawTileAtPos',
            'drawVerticalArrowDirection',
            'drawHorizontalArrowDirection',
        ]);
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['']);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['removeTile', 'drawOneLetter']);
        TestBed.configureTestingModule({
            providers: [
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
                { provide: DrawingBoardService, useValue: drawingBoardServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: Router, useValue: routerSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        infoClientServiceSpyObj.game = new GameServer(1, false, 'Multi', false);
        infoClientServiceSpyObj.player = new Player('Multi');
        service = TestBed.inject(PlaceGraphicService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should call deleteLetterPlacedOnBoard the as many time as there are lettersdrawn', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'abcde';
        const spydeleteLetterPlacedOnBoard = spyOn<any>(service, 'deleteLetterPlacedOnBoard').and.stub();
        service['deleteEveryLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(spydeleteLetterPlacedOnBoard).toHaveBeenCalledTimes(5);
    });
    it('should not call deleteLetterPlacedOnBoard if there are no letters drawn', () => {
        drawingBoardServiceSpyObj.lettersDrawn = '';
        const spydeleteLetterPlacedOnBoard = spyOn<any>(service, 'deleteLetterPlacedOnBoard').and.stub();
        service['deleteEveryLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(spydeleteLetterPlacedOnBoard).toHaveBeenCalledTimes(0);
    });

    it('should return if its not the players turn', () => {
        infoClientServiceSpyObj.displayTurn = "C'est au tour de votre adversaire !";
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'asdasd');
        expect(drawingServiceSpyObj.removeTile).toHaveBeenCalledTimes(0);
    });
    it('should return if its not the players turn', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        drawingBoardServiceSpyObj.arrowPosX = 16;
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(drawingServiceSpyObj.removeTile).toHaveBeenCalledTimes(0);
    });
    it('should return if its not the players turn', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        drawingBoardServiceSpyObj.arrowPosY = 16;
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(drawingServiceSpyObj.removeTile).toHaveBeenCalledTimes(0);
    });
    it('should not call createPlaceMessage if there are no lettersDrawn', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        const spycreatePlaceMessage = spyOn<any>(service, 'createPlaceMessage').and.stub();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'Enter');
        expect(spycreatePlaceMessage).toHaveBeenCalledTimes(0);
    });
    it('should not call deleteLetterPlacedOnBoard if backspace is pressed without lettersDrawn', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        const spydeleteLetterPlacedOnBoard = spyOn<any>(service, 'deleteLetterPlacedOnBoard').and.stub();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'Backspace');
        expect(spydeleteLetterPlacedOnBoard).toHaveBeenCalledTimes(0);
    });
    it('should call deleteLetterPlacedOnBoard if backspace is pressed', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = 'asds';
        const spydeleteLetterPlacedOnBoard = spyOn<any>(service, 'deleteLetterPlacedOnBoard').and.stub();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'Backspace');
        expect(spydeleteLetterPlacedOnBoard).toHaveBeenCalledTimes(1);
    });
    it('should call deleteLetterPlacedOnBoard if backspace is pressed', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        const spydeleteEveryLetterPlacedOnBoard = spyOn<any>(service, 'deleteEveryLetterPlacedOnBoard').and.callFake(() => {
            return;
        });
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'Escape');
        expect(spydeleteEveryLetterPlacedOnBoard).toHaveBeenCalledTimes(0);
    });
    it('should call deleteEveryLetterPlacedOnBoard if Escape is pressed', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = 'asds';
        const spydeleteEveryLetterPlacedOnBoard = spyOn<any>(service, 'deleteEveryLetterPlacedOnBoard').and.callFake(() => {
            return;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefined;
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'Escape');
        expect(spydeleteEveryLetterPlacedOnBoard).toHaveBeenCalledTimes(1);
    });
    it('should call placeUpperCaseLetter if a capital letter is inputed', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = 'asds';
        const spyplaceUpperCaseLetter = spyOn<any>(service, 'placeUpperCaseLetter').and.stub();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'A');
        expect(spyplaceUpperCaseLetter).toHaveBeenCalledTimes(1);
    });
    it('should call placeUpperCaseLetter if a capital letter is inputed', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = 'allo';
        infoClientServiceSpyObj.player.mapLetterOnStand = new Map();
        infoClientServiceSpyObj.player.mapLetterOnStand = new Map();
        infoClientServiceSpyObj.player.mapLetterOnStand.set('a', 1);
        infoClientServiceSpyObj.player.mapLetterOnStand.set('l', 1);
        infoClientServiceSpyObj.player.mapLetterOnStand.set('l', 1);
        infoClientServiceSpyObj.player.mapLetterOnStand.set('o', 1);
        const spycreatePlaceMessage = spyOn<any>(service, 'createPlaceMessage').and.callFake(() => {
            return '!placer h8h allo';
        });
        const spydeleteEveryLetterPlacedOnBoard = spyOn<any>(service, 'deleteEveryLetterPlacedOnBoard').and.stub();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'Enter');
        expect(spycreatePlaceMessage).toHaveBeenCalled();
        expect(spydeleteEveryLetterPlacedOnBoard).toHaveBeenCalledTimes(1);
    });
    it('should call placeUpperCaseLetter if a capital letter is inputed', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = 'adhbawiugabi';
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map();
        infoClientServiceSpyObj.player.mapLetterOnStand = new Map();
        const spycreatePlaceMessage = spyOn<any>(service, 'createPlaceMessage').and.callFake(() => {
            return '!placer h8h adhbawiugabi';
        });
        const spydeleteEveryLetterPlacedOnBoard = spyOn<any>(service, 'deleteEveryLetterPlacedOnBoard').and.stub();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'Enter');
        expect(spycreatePlaceMessage).toHaveBeenCalled();
        expect(spydeleteEveryLetterPlacedOnBoard).toHaveBeenCalledTimes(1);
    });
    it('should return if its not the players turn', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.arrowPosX = 2;
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][3] = tileStubDefined;
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefined;
        drawingServiceSpyObj.removeTile.and.callThrough();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(service['startLettersPlacedPosX']).toBeDefined();
        expect(service['startLettersPlacedPosY']).toBeDefined();
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.arrowPosX = 2;
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callThrough();
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][3] = tileStubDefined;
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefined;
        drawingServiceSpyObj.removeTile.and.callThrough();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'b');
        expect(drawingServiceSpyObj.removeTile).toHaveBeenCalledTimes(0);
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.arrowPosX = 1;
        const findIndexLetterInStandForPlacementSpy = spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.arrowPosX = 2;
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][3] = tileStubDefined;
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefined;
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(findIndexLetterInStandForPlacementSpy).toHaveBeenCalledTimes(1);
    });
    it('should call removeTile once', () => {
        // doesnt work
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        spyOn<any>(service, 'keyEnteredKeyboard').and.stub();
        drawingServiceSpyObj.removeTile.and.stub();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(drawingServiceSpyObj.removeTile).toHaveBeenCalledTimes(1);
    });
    it('should call keyEnteredKeyboard', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        const spykeyEnteredKeyboard = spyOn<any>(service, 'keyEnteredKeyboard').and.stub();
        drawingServiceSpyObj.removeTile.and.stub();
        service.manageKeyBoardEvent(infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(spykeyEnteredKeyboard).toHaveBeenCalledTimes(1);
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.arrowPosX = 1;
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefinedOld;

        service['placeUpperCaseLetter'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(drawingServiceSpyObj.removeTile).toHaveBeenCalledTimes(0);
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.arrowPosX = 1;
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        drawingBoardServiceSpyObj.arrowPosX = 16;
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefinedOld;
        service['placeUpperCaseLetter'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'b');
        expect(drawingServiceSpyObj.removeTile).toHaveBeenCalledTimes(0);
    });
    it('should call keyEnteredKeyboard', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = blankTileStubDefinedOld;
        const spykeyEnteredKeyboard = spyOn<any>(service, 'keyEnteredKeyboard').and.stub();
        drawingServiceSpyObj.removeTile.and.stub();
        service['placeUpperCaseLetter'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(spykeyEnteredKeyboard).toHaveBeenCalledTimes(1);
    });
    it('should call keyEnteredKeyboard', () => {
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        drawingBoardServiceSpyObj.arrowPosX = 16;
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = blankTileStubDefinedOld;
        const spykeyEnteredKeyboard = spyOn<any>(service, 'keyEnteredKeyboard').and.stub();
        drawingServiceSpyObj.removeTile.and.stub();
        service['placeUpperCaseLetter'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(spykeyEnteredKeyboard).toHaveBeenCalledTimes(0);
    });
    it('should call removeTile once', () => {
        // doesnt work
        infoClientServiceSpyObj.displayTurn = "C'est votre tour !";
        drawingBoardServiceSpyObj.lettersDrawn = '';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = blankTileStubDefinedOld;
        spyOn<any>(service, 'keyEnteredKeyboard').and.stub();
        drawingServiceSpyObj.removeTile.and.stub();
        service['placeUpperCaseLetter'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player, 'a');
        expect(drawingServiceSpyObj.removeTile).toHaveBeenCalledTimes(1);
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'abc';
        service['startLettersPlacedPosX'] = 1;
        service['startLettersPlacedPosY'] = 1;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        expect(service['createPlaceMessage']()).toBe('!placer a1v abc');
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'abc';
        service['startLettersPlacedPosX'] = 1;
        service['startLettersPlacedPosY'] = 1;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        expect(service['createPlaceMessage']()).toBe('!placer a1h abc');
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        drawingBoardServiceSpyObj.lettersDrawn = '';
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingServiceSpyObj.drawOneLetter).toHaveBeenCalledTimes(0);
    });
    it('should call drawOnLetter', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 2;
        drawingBoardServiceSpyObj.arrowPosY = 2;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();

        infoClientServiceSpyObj.game.board[1][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][2] = tileStubDefined;
        drawingBoardServiceSpyObj.removeTile.and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingServiceSpyObj.drawOneLetter).toHaveBeenCalledTimes(1);
    });
    it('should call removeTile twice', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 2;
        drawingBoardServiceSpyObj.arrowPosY = 2;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        service['startLettersPlacedPosX'] = 0;
        service['startLettersPlacedPosY'] = 0;
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][2] = tileStubDefined;
        drawingBoardServiceSpyObj.removeTile.and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingBoardServiceSpyObj.removeTile).toHaveBeenCalledTimes(1);
    });
    it('should draw a vertical arrow', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 2;
        drawingBoardServiceSpyObj.arrowPosY = 2;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][2] = tileStubDefined;
        drawingBoardServiceSpyObj.removeTile.and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingBoardServiceSpyObj.drawVerticalArrowDirection).toHaveBeenCalledTimes(1);
    });
    it('should call removeTile twice', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 3;
        drawingBoardServiceSpyObj.arrowPosY = 2;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[3][2] = tileStubDefined;
        drawingBoardServiceSpyObj.removeTile.and.stub();
        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingBoardServiceSpyObj.removeTile).toHaveBeenCalledTimes(1);
    });
    it('should draw a horizontal arrow', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 3;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[3][2] = tileStubDefined;
        drawingBoardServiceSpyObj.removeTile.and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        drawingBoardServiceSpyObj.drawHorizontalArrowDirection.and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingBoardServiceSpyObj.drawHorizontalArrowDirection).toHaveBeenCalledTimes(1);
    });
    it('should draw a vertical arrow', () => {
        drawingBoardServiceSpyObj.lettersDrawn = '*';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 3;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[3][2] = tileStubDefined;
        drawingBoardServiceSpyObj.removeTile.and.stub();
        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        drawingBoardServiceSpyObj.drawHorizontalArrowDirection.and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingBoardServiceSpyObj.drawHorizontalArrowDirection).toHaveBeenCalledTimes(1);
    });
    it('lettersDrawn should be aaa', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[3][1] = tileStubDefined;
        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        drawingBoardServiceSpyObj.removeTile.and.stub();
        drawingServiceSpyObj.drawOneLetter.and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['keyEnteredKeyboard'](infoClientServiceSpyObj.game, 'a');
        expect(drawingBoardServiceSpyObj.lettersDrawn).toBe('aaa');
    });
    it('lettersDrawn should be aaa', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][3] = tileStubDefined;
        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        drawingBoardServiceSpyObj.removeTile.and.stub();
        drawingServiceSpyObj.drawOneLetter.and.stub();
        drawingBoardServiceSpyObj.drawHorizontalArrowDirection.and.stub();
        service['keyEnteredKeyboard'](infoClientServiceSpyObj.game, 'a');
        expect(drawingBoardServiceSpyObj.lettersDrawn).toBe('aaa');
    });
    it('should call drawOneLetter once', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][3] = tileStubDefined;

        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        drawingBoardServiceSpyObj.removeTile.and.stub();
        drawingServiceSpyObj.drawOneLetter.and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['keyEnteredKeyboard'](infoClientServiceSpyObj.game, 'a');
        expect(drawingServiceSpyObj.drawOneLetter).toHaveBeenCalledTimes(1);
    });
    it('should draw a vertical arrow', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();

        infoClientServiceSpyObj.game.board[2][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[3][1] = tileStubDefined;
        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        drawingBoardServiceSpyObj.removeTile.and.stub();
        drawingServiceSpyObj.drawOneLetter.and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['keyEnteredKeyboard'](infoClientServiceSpyObj.game, 'a');
        expect(drawingBoardServiceSpyObj.drawVerticalArrowDirection).toHaveBeenCalledTimes(1);
    });
    it('should draw a horizontal arrow', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][3] = tileStubDefined;

        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        drawingBoardServiceSpyObj.removeTile.and.stub();
        drawingServiceSpyObj.drawOneLetter.and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['keyEnteredKeyboard'](infoClientServiceSpyObj.game, 'a');
        expect(drawingBoardServiceSpyObj.drawHorizontalArrowDirection).toHaveBeenCalledTimes(1);
    });
    it('should not draw arrows', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 15;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[16] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[15] = new Array<Tile>();

        infoClientServiceSpyObj.game.board[16][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[15][1] = tileStubDefined;

        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        drawingBoardServiceSpyObj.removeTile.and.stub();
        drawingServiceSpyObj.drawOneLetter.and.stub();
        drawingBoardServiceSpyObj.drawHorizontalArrowDirection.and.stub();
        service['keyEnteredKeyboard'](infoClientServiceSpyObj.game, 'a');
        expect(drawingBoardServiceSpyObj.drawHorizontalArrowDirection).toHaveBeenCalledTimes(0);
    });
    it('should change the lettersDrawn', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[0] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();

        infoClientServiceSpyObj.game.board[0][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[2][1] = tileStubDefinedOld;
        service['checkIfThereAreLettersBefore'](infoClientServiceSpyObj.game, true);
        expect(drawingBoardServiceSpyObj.lettersDrawn).toBe('aaa');
    });
    it('should change the startLettersPlacedPosX', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[0] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[0][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[2][1] = tileStubDefinedOld;
        service['checkIfThereAreLettersBefore'](infoClientServiceSpyObj.game, true);
        expect(service['startLettersPlacedPosX']).toBe(1);
    });
    it('should change the startLettersPlacedPosX', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[0] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[0][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[2][1] = tileStubDefinedOld;
        service['checkIfThereAreLettersBefore'](infoClientServiceSpyObj.game, false);
        expect(drawingBoardServiceSpyObj.lettersDrawn.length).toBe(0);
    });
    it('should change the startLettersPlacedPosY', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 1;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[0] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();

        infoClientServiceSpyObj.game.board[0][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[2][1] = tileStubDefinedOld;
        service['checkIfThereAreLettersBefore'](infoClientServiceSpyObj.game, true);

        expect(service['startLettersPlacedPosY']).toBe(1);
    });
    it('should change the lettersDrawn', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 3;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][0] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        service['checkIfThereAreLettersBefore'](infoClientServiceSpyObj.game, true);
        expect(drawingBoardServiceSpyObj.lettersDrawn).toBe('aaa');
    });
    it('should change the lettersDrawn', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 3;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][0] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        service['checkIfThereAreLettersBefore'](infoClientServiceSpyObj.game, false);
        expect(drawingBoardServiceSpyObj.lettersDrawn.length).toBe(0);
    });
    it('should change the startLettersPlacedPosY', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 3;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][0] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        service['checkIfThereAreLettersBefore'](infoClientServiceSpyObj.game, true);
        expect(service['startLettersPlacedPosY']).toBe(1);
    });
    it('should change the startLettersPlacedPosX', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.arrowPosX = 3;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();

        infoClientServiceSpyObj.game.board[1][0] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        service['checkIfThereAreLettersBefore'](infoClientServiceSpyObj.game, true);
        expect(service['startLettersPlacedPosX']).toBe(1);
    });
    it('findIndexLetterInStand should return 0', () => {
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefinedOld;
        expect(service['findIndexLetterInStand']('a', 0, infoClientServiceSpyObj.player)).toBe(0);
    });
    it('findIndexLetterInStand should return 0', () => {
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefinedOld;
        expect(service['findIndexLetterInStand']('a', 1, infoClientServiceSpyObj.player)).toBe(0);
    });
    it('findIndexLetterInStand should return 0', () => {
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefinedOld;
        expect(service['findIndexLetterInStandForPlacement']('a', true, infoClientServiceSpyObj.player)).toBe(0);
    });
    it('findIndexLetterInStand should return -1', () => {
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = tileStubDefined;
        expect(service['findIndexLetterInStandForPlacement']('a', true, infoClientServiceSpyObj.player)).toBe(-1);
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        drawingBoardServiceSpyObj.isArrowVertical = false;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.arrowPosX = 3;
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][3] = tileStubDefined;
        expect(service['areAllLettersBeforeOld'](infoClientServiceSpyObj.game)).toBe(false);
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.isArrowVertical = false;
        drawingBoardServiceSpyObj.arrowPosY = 1;
        drawingBoardServiceSpyObj.arrowPosX = 4;
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[1][3] = tileStubDefined;
        expect(service['areAllLettersBeforeOld'](infoClientServiceSpyObj.game)).toBe(true);
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        drawingBoardServiceSpyObj.isArrowVertical = true;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.arrowPosX = 1;
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[3][1] = tileStubDefined;
        expect(service['areAllLettersBeforeOld'](infoClientServiceSpyObj.game)).toBe(false);
    });
    it('should not call remove tile if the letterPos is not found or undefined', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        drawingBoardServiceSpyObj.isArrowVertical = true;
        drawingBoardServiceSpyObj.arrowPosY = 4;
        drawingBoardServiceSpyObj.arrowPosX = 1;
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][1] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[3][1] = tileStubDefined;
        expect(service['areAllLettersBeforeOld'](infoClientServiceSpyObj.game)).toBe(true);
    });
    it('should draw a vertical arrow', () => {
        drawingBoardServiceSpyObj.lettersDrawn = '*';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 3;
        service['startLettersPlacedPosX'] = 3;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[3][2] = tileStubDefined;
        drawingBoardServiceSpyObj.removeTile.and.stub();
        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        drawingBoardServiceSpyObj.drawHorizontalArrowDirection.and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingBoardServiceSpyObj.drawHorizontalArrowDirection).toHaveBeenCalledTimes(0);
    });
    it('should draw a vertical arrow', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 2;
        drawingBoardServiceSpyObj.arrowPosY = 2;
        service['startLettersPlacedPosY'] = 2;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][2] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][2] = tileStubDefined;
        drawingBoardServiceSpyObj.removeTile.and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingBoardServiceSpyObj.drawVerticalArrowDirection).toHaveBeenCalledTimes(0);
    });
    it('should draw a vertical arrow', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 3;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.isArrowVertical = true;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[1][3] = tileStubDefined;
        infoClientServiceSpyObj.game.board[2][3] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[3][3] = tileStubDefinedOld;

        drawingBoardServiceSpyObj.removeTile.and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        drawingBoardServiceSpyObj.drawTileAtPos.and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingBoardServiceSpyObj.drawVerticalArrowDirection).toHaveBeenCalledTimes(1);
    });
    it('should draw a vertical arrow', () => {
        drawingBoardServiceSpyObj.lettersDrawn = 'a';
        spyOn<any>(service, 'findIndexLetterInStandForPlacement').and.callFake(() => {
            return 0;
        });
        infoClientServiceSpyObj.player.stand = new Array<Tile>();
        infoClientServiceSpyObj.player.stand[0] = new Tile();
        infoClientServiceSpyObj.player.stand[0].letter = new Letter();
        infoClientServiceSpyObj.player.stand[0].letter.value = 'a';
        infoClientServiceSpyObj.player.stand[0].position = new Vec4();
        infoClientServiceSpyObj.player.stand[0].position.x1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.y1 = 1;
        infoClientServiceSpyObj.player.stand[0].position.width = 1;
        infoClientServiceSpyObj.player.stand[0].position.height = 1;
        drawingBoardServiceSpyObj.arrowPosX = 3;
        drawingBoardServiceSpyObj.arrowPosY = 3;
        drawingBoardServiceSpyObj.isArrowVertical = false;
        infoClientServiceSpyObj.game.mapLetterOnBoard = new Map<string, object>();
        infoClientServiceSpyObj.game.mapLetterOnBoard.set('a', { value: 1 });
        infoClientServiceSpyObj.game.board = new Array<Tile[]>();
        infoClientServiceSpyObj.game.board[1] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[2] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3] = new Array<Tile>();
        infoClientServiceSpyObj.game.board[3][1] = tileStubDefined;
        infoClientServiceSpyObj.game.board[3][2] = tileStubDefinedOld;
        infoClientServiceSpyObj.game.board[3][3] = tileStubDefinedOld;

        drawingBoardServiceSpyObj.removeTile.and.stub();
        spyOn<any>(service, 'areAllLettersBeforeOld').and.stub();
        spyOn<any>(service, 'checkIfThereAreLettersBefore').and.stub();
        drawingBoardServiceSpyObj.drawTileAtPos.and.stub();
        drawingBoardServiceSpyObj.drawVerticalArrowDirection.and.stub();
        service['deleteLetterPlacedOnBoard'](infoClientServiceSpyObj.game, infoClientServiceSpyObj.player);
        expect(drawingBoardServiceSpyObj.drawHorizontalArrowDirection).toHaveBeenCalledTimes(1);
    });

    it("isLettersDrawnSizeAboveZero() should return true if letterDrawn is defined", () => {
        drawingBoardServiceSpyObj.lettersDrawn = "test";

        const returnValue = service.isLettersDrawnSizeAboveZero();
        expect(returnValue).toEqual(true);
    });

    it("isLettersDrawnSizeAboveZero() should return false if letterDrawn is undefined", () => {
        drawingBoardServiceSpyObj.lettersDrawn = "";

        const returnValue = service.isLettersDrawnSizeAboveZero();
        expect(returnValue).toEqual(false);
    });
});
