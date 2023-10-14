/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import { Letter } from '@app/classes/letter';
import { Move } from '@app/classes/move';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as io from 'socket.io';
import { BoardExplorerService } from './board-explorer.service';
import { BoardService } from './board.service';
import { DictionaryService } from './dictionary.service';
import { LetterBankService } from './letter-bank.service';
import { PutLogicService } from './put-logic.service';
import { ScoreCountService } from './score-count.service';
import { StandService } from './stand.service';

describe('PutLogicService', () => {
    let service: PutLogicService;
    let standServiceSpy: SinonStubbedInstance<StandService>;
    let dictionaryServiceSpy: SinonStubbedInstance<DictionaryService>;
    let boardExplorerServiceSpy: SinonStubbedInstance<BoardExplorerService>;
    let letterBankServiceSpy: SinonStubbedInstance<LetterBankService>;
    let scoreCountServiceSpy: SinonStubbedInstance<ScoreCountService>;
    let boardServiceSpy: SinonStubbedInstance<BoardService>;

    let playerStubDefined: Player;
    let gameStubDefined: GameServer;

    const tileStubDefined = {
        letter: {
            value: 't',
            weight: 10,
        },
        old: false,
    } as Tile;

    beforeEach(() => {
        playerStubDefined = new Player('Joe');
        gameStubDefined = new GameServer(1, false, 'Multi', false, '');

        standServiceSpy = createStubInstance(StandService);
        dictionaryServiceSpy = createStubInstance(DictionaryService);
        boardExplorerServiceSpy = createStubInstance(BoardExplorerService);
        letterBankServiceSpy = createStubInstance(LetterBankService);
        scoreCountServiceSpy = createStubInstance(ScoreCountService);
        boardServiceSpy = createStubInstance(BoardService);

        service = new PutLogicService(
            standServiceSpy,
            dictionaryServiceSpy,
            boardExplorerServiceSpy,
            letterBankServiceSpy,
            scoreCountServiceSpy,
            boardServiceSpy,
        );

        service.sio = new io.Server();
    });

    it('should be created', () => {
        expect(service).to.equal(service);
    });

    it('computeWordToExchange', () => {
        service.computeWordToExchange(gameStubDefined, playerStubDefined, 'wordres');
        Sinon.assert.called(standServiceSpy.updateStandAfterExchange);
    });

    it('computeWordToDraw should call countScoreArray once', () => {
        const checkWordSpy = Sinon.stub(service as any, 'checkWordsValidity').returns(true);
        const boardLogicUpdateSpy = Sinon.stub(service, 'boardLogicUpdate').returns();
        scoreCountServiceSpy.countScoreArray.returns(1);
        scoreCountServiceSpy.updateScore.returns();

        const updateStandSpy = Sinon.stub(service as any, 'updateStandAndBoardAfterPlacement');

        service.computeWordToDraw(gameStubDefined, playerStubDefined, 'a1h', 'word');
        Sinon.assert.called(updateStandSpy);

        checkWordSpy.restore();
        boardLogicUpdateSpy.restore();
        scoreCountServiceSpy.countScoreArray.restore();
        scoreCountServiceSpy.updateScore.restore();
    });

    it('computeWordToDraw should call countScoreArray once', () => {
        const checkWordSpy = Sinon.stub(service as any, 'checkWordsValidity').returns(false);
        const boardLogicUpdateSpy = Sinon.stub(service, 'boardLogicUpdate').returns();
        const boardLogicRemoveSpy = Sinon.stub(service, 'boardLogicRemove').returns();
        scoreCountServiceSpy.countScoreArray.returns(1);
        scoreCountServiceSpy.updateScore.returns();

        const updateStandSpy = Sinon.stub(service as any, 'updateStandAndBoardAfterPlacement');

        service.computeWordToDraw(gameStubDefined, playerStubDefined, 'a1h', 'word');
        Sinon.assert.called(updateStandSpy);

        checkWordSpy.restore();
        boardLogicUpdateSpy.restore();
        boardLogicRemoveSpy.restore();
        scoreCountServiceSpy.countScoreArray.restore();
        scoreCountServiceSpy.updateScore.restore();
    });

    it('computeWordVPToDraw should call countScoreArray once', () => {
        const boardLogicUpdateSpy = Sinon.stub(service, 'boardLogicUpdate').returns();
        scoreCountServiceSpy.updateScore.returns();

        const stubMove = {
            score: 1,
            command: 'command',
            stand: ['stand'],
            word: 'word',
        } as Move;

        playerStubDefined.isMoveBingo = true;
        playerStubDefined.allLetterSwapped = true;

        service.computeWordVPToDraw(gameStubDefined, playerStubDefined, stubMove);
        Sinon.assert.called(scoreCountServiceSpy.updateScore);

        boardLogicUpdateSpy.restore();
        scoreCountServiceSpy.updateScore.restore();
    });

    it('initSioPutLogic should set the sio of the class', () => {
        const newSio = new io.Server();
        service.initSioPutLogic(newSio);
        expect(service.sio).to.equal(newSio);
    });

    it('updateStandOpponent should call writeLetterStandLogic 7 times', () => {
        const stand = new Array<string>();
        playerStubDefined.mapLetterOnStand = new Map<string, object>();
        playerStubDefined.mapLetterOnStand.set('a', { value: 1 });

        playerStubDefined.stand = [
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
        ];
        letterBankServiceSpy.giveRandomLetter.returns('a');
        // ['a', 'b', 'c', 'd', 'e', 'f', 'g']
        service['updateStandOpponent'](gameStubDefined, playerStubDefined, stand);
        Sinon.assert.called(standServiceSpy.writeLetterStandLogic);

        letterBankServiceSpy.giveRandomLetter.restore();
    });

    it('updateStandOpponent should call writeLetterStandLogic', () => {
        playerStubDefined.mapLetterOnStand = new Map<string, object>();
        playerStubDefined.stand = [
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
        ];
        letterBankServiceSpy.giveRandomLetter.returns('a');

        service['updateStandOpponent'](gameStubDefined, playerStubDefined, ['a', 'b', 'c']);
        Sinon.assert.called(standServiceSpy.writeLetterStandLogic);
    });

    it('verifyIfTileOnBoardAlready should return false if the tile is not on the board', () => {
        gameStubDefined.mapLetterOnBoard = new Map<string, object>();
        gameStubDefined.mapLetterOnBoard.set('a', { value: 1 });
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][1] = tileStubDefined;

        const returnValue = service['verifyIfTileOnBoardAlready'](gameStubDefined, 'a', 0, 'a1h');

        expect(returnValue).to.equal(false);
    });

    it('verifyIfTileOnBoardAlready should return false if the tile is not on the board', () => {
        gameStubDefined.mapLetterOnBoard = new Map<string, object>();
        gameStubDefined.mapLetterOnBoard.set('a', { value: 1 });
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][1] = tileStubDefined;

        const returnValue = service['verifyIfTileOnBoardAlready'](gameStubDefined, 'a', 0, 'a1v');
        expect(returnValue).to.equal(false);
    });

    it('verifyIfTileOnBoardAlready should return true if the tile is on the board already', () => {
        gameStubDefined.mapLetterOnBoard = new Map<string, object>();
        gameStubDefined.mapLetterOnBoard.set('t', { value: 1 });
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][1] = new Tile();
        gameStubDefined.board[1][1].old = true;
        gameStubDefined.board[1][1].letter = new Letter();
        gameStubDefined.board[1][1].letter.value = 't';

        const returnValue = service['verifyIfTileOnBoardAlready'](gameStubDefined, 't', 0, 'a1h');
        expect(returnValue).to.equal(true);
    });

    it('cancelUpdateOperation should call drawBoardInit and reDrawTilesBoard once', (done) => {
        playerStubDefined.stand[2] = new Tile();
        playerStubDefined.stand[2] = tileStubDefined;

        service['cancelUpdateOperation'](gameStubDefined, playerStubDefined, [0], ['a']);

        const waitDelay = 5000;
        setTimeout(() => {
            Sinon.assert.called(standServiceSpy.writeLetterStandLogic);
            done();
        }, waitDelay);
    });

    it('updateStandAndBoardAfterPlacement should call 0 times putNewLetterOnStand because the player do not have the letter on his stand', () => {
        playerStubDefined.mapLetterOnStand = new Map<string, object>();

        service['updateStandAndBoardAfterPlacement'](gameStubDefined, playerStubDefined, 'A', 'a1h', false);
        Sinon.assert.notCalled(standServiceSpy.putNewLetterOnStand);
    });

    it('updateStandAndBoardAfterPlacement should call 0 times putNewLetterOnStand because the tile is on the board already', () => {
        playerStubDefined.mapLetterOnStand = new Map<string, object>();
        playerStubDefined.mapLetterOnStand.set('a', { value: 1 });
        const verifyIfTileOnBoardSpy = Sinon.stub(service as any, 'verifyIfTileOnBoardAlready').returns(true);

        service['updateStandAndBoardAfterPlacement'](gameStubDefined, playerStubDefined, 'a', 'a1h', false);
        Sinon.assert.notCalled(standServiceSpy.putNewLetterOnStand);

        verifyIfTileOnBoardSpy.restore();
    });

    it('updateStandAndBoardAfterPlacement should call putNewLetterOnStand 0 times and call cancelUpdateOperation', () => {
        playerStubDefined.mapLetterOnStand = new Map<string, object>();
        playerStubDefined.mapLetterOnStand.set('t', { value: 1 });
        const verifyTileOnBoardSpy = Sinon.stub(service as any, 'verifyIfTileOnBoardAlready').returns(false);
        const cancelUpdateSpy = Sinon.stub(service as any, 'cancelUpdateOperation');

        playerStubDefined.stand = [
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
        ];
        playerStubDefined.stand[0].letter = new Letter();
        playerStubDefined.stand[0].letter.value = 't';

        service['updateStandAndBoardAfterPlacement'](gameStubDefined, playerStubDefined, 't', 'a1h', false);
        Sinon.assert.called(cancelUpdateSpy);

        verifyTileOnBoardSpy.restore();
        cancelUpdateSpy.restore();
    });

    it('updateStandAndBoardAfterPlacement should call putNewLetterOnStand 1 times ', () => {
        playerStubDefined.mapLetterOnStand = new Map<string, object>();
        playerStubDefined.mapLetterOnStand.set('t', { value: 1 });
        const verifyTileOnBoardSpy = Sinon.stub(service as any, 'verifyIfTileOnBoardAlready').returns(false);

        playerStubDefined.stand = [
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
        ];
        playerStubDefined.stand[0].letter = new Letter();
        playerStubDefined.stand[0].letter.value = 't';

        service['updateStandAndBoardAfterPlacement'](gameStubDefined, playerStubDefined, 't', 'a1h', true);
        Sinon.assert.called(standServiceSpy.putNewLetterOnStand);

        verifyTileOnBoardSpy.restore();
    });

    it('checkWordsValidity should return false for a word not valid', () => {
        boardExplorerServiceSpy.formWordString.returns(['jiii']);

        const returnTest = service['checkWordsValidity'](gameStubDefined, 'a1h');
        Sinon.assert.called(dictionaryServiceSpy.containsWord);
        expect(returnTest).to.equal(false);
    });

    it('boardLogicUpdate should not change anything if tile.old === false with horizontal position', () => {
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[0] = new Array<Tile>();
        gameStubDefined.board[0][0] = tileStubDefined;
        gameStubDefined.board[0][1] = tileStubDefined;
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][0] = tileStubDefined;
        gameStubDefined.board[1][1] = tileStubDefined;
        letterBankServiceSpy.checkLetterWeight.returns(1);

        service.boardLogicUpdate(gameStubDefined, 'a1h', 'b');
        expect(gameStubDefined.board[0][0].letter.value).to.equal('b');
        expect(gameStubDefined.board[0][0].letter.weight).to.equal(1);

        letterBankServiceSpy.checkLetterWeight.restore();
    });

    it('boardLogicUpdate should not change anything if tile.old === true with horizontal position', () => {
        const tileStubOldTrue = {
            letter: {
                value: 't',
                weight: 10,
            },
            old: true,
        } as Tile;
        const defaultWeight = 10;
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[0] = new Array<Tile>();
        gameStubDefined.board[0][0] = tileStubOldTrue;
        gameStubDefined.board[0][1] = tileStubOldTrue;
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][0] = tileStubOldTrue;
        gameStubDefined.board[1][1] = tileStubOldTrue;

        service.boardLogicUpdate(gameStubDefined, 'a1h', 'b');
        expect(gameStubDefined.board[0][0].letter.value).to.equal('t');
        expect(gameStubDefined.board[0][0].letter.weight).to.equal(defaultWeight);
    });

    it('boardLogicUpdate should not change anything if tile.old === false with vertical position', () => {
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[0] = new Array<Tile>();
        gameStubDefined.board[0][0] = tileStubDefined;
        gameStubDefined.board[0][1] = tileStubDefined;
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][0] = tileStubDefined;
        gameStubDefined.board[1][1] = tileStubDefined;
        letterBankServiceSpy.checkLetterWeight.returns(1);

        service.boardLogicUpdate(gameStubDefined, 'a1v', 'b');
        expect(gameStubDefined.board[0][0].letter.value).to.equal('b');
        expect(gameStubDefined.board[0][0].letter.weight).to.equal(1);

        letterBankServiceSpy.checkLetterWeight.restore();
    });

    it('boardLogicUpdate should not change anything if tile.old === true with vertical position', () => {
        const tileStubOldTrue = {
            letter: {
                value: 't',
                weight: 10,
            },
            old: true,
        } as Tile;
        const defaultWeight = 10;
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[0] = new Array<Tile>();
        gameStubDefined.board[0][0] = tileStubOldTrue;
        gameStubDefined.board[0][1] = tileStubOldTrue;
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][0] = tileStubOldTrue;
        gameStubDefined.board[1][1] = tileStubOldTrue;

        service.boardLogicUpdate(gameStubDefined, 'a1v', 'b');
        expect(gameStubDefined.board[0][0].letter.value).to.equal('t');
        expect(gameStubDefined.board[0][0].letter.weight).to.equal(defaultWeight);
    });

    it('boardLogicRemove should change board if tile.old === false with horizontal position', () => {
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[0] = new Array<Tile>();
        gameStubDefined.board[0][0] = tileStubDefined;
        gameStubDefined.board[0][1] = tileStubDefined;
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][0] = tileStubDefined;
        gameStubDefined.board[1][1] = tileStubDefined;

        service.boardLogicRemove(gameStubDefined, 'a1h', 'b');
        expect(gameStubDefined.board[0][0].letter.value).to.equal('');
        expect(gameStubDefined.board[0][0].letter.weight).to.equal(0);
    });

    it('boardLogicRemove should not change anything if tile.old === true with vertical position', () => {
        const tileStubOldTrue = {
            letter: {
                value: 't',
                weight: 10,
            },
            old: true,
        } as Tile;
        const defaultWeight = 10;
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[0] = new Array<Tile>();
        gameStubDefined.board[0][0] = tileStubOldTrue;
        gameStubDefined.board[0][1] = tileStubOldTrue;
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][0] = tileStubOldTrue;
        gameStubDefined.board[1][1] = tileStubOldTrue;

        service.boardLogicRemove(gameStubDefined, 'a1h', 'b');
        expect(gameStubDefined.board[0][0].letter.value).to.equal('t');
        expect(gameStubDefined.board[0][0].letter.weight).to.equal(defaultWeight);
    });

    it('boardLogicRemove should change board anything if tile.old === false with vertical position', () => {
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[0] = new Array<Tile>();
        gameStubDefined.board[0][0] = tileStubDefined;
        gameStubDefined.board[0][1] = tileStubDefined;
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][0] = tileStubDefined;
        gameStubDefined.board[1][1] = tileStubDefined;

        service.boardLogicRemove(gameStubDefined, 'a1v', 'b');
        expect(gameStubDefined.board[0][0].letter.value).to.equal('');
        expect(gameStubDefined.board[0][0].letter.weight).to.equal(0);
    });

    it('boardLogicRemove should not change anything if tile.old === true with vertical position', () => {
        const tileStubOldTrue = {
            letter: {
                value: 't',
                weight: 10,
            },
            old: true,
        } as Tile;
        const defaultWeight = 10;
        gameStubDefined.board = new Array<Tile[]>();
        gameStubDefined.board[0] = new Array<Tile>();
        gameStubDefined.board[0][0] = tileStubOldTrue;
        gameStubDefined.board[0][1] = tileStubOldTrue;
        gameStubDefined.board[1] = new Array<Tile>();
        gameStubDefined.board[1][0] = tileStubOldTrue;
        gameStubDefined.board[1][1] = tileStubOldTrue;

        service.boardLogicRemove(gameStubDefined, 'a1v', 'b');
        expect(gameStubDefined.board[0][0].letter.value).to.equal('t');
        expect(gameStubDefined.board[0][0].letter.weight).to.equal(defaultWeight);
    });
});
