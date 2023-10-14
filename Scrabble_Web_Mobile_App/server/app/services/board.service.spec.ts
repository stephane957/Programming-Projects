/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { BoardService } from './board.service';

describe('BoardService', () => {
    let service: BoardService;
    let gameStub: GameServer;
    beforeEach(async () => {
        gameStub = new GameServer(1, false, 'Multi', true, '')
        gameStub.bonusBoard = [
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
        ];


        service = new BoardService();
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it("initBoardArray() should defined all the board array", () => {
        service.initBoardArray(gameStub);

        for (let i = 0; i < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2; i++) {
            for (let j = 0; j < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2; j++) {
                expect(gameStub.board[i][j]).to.exist;
            }
        }
    });

    it("writeLetterInGameMap should add a letter in the player's map", () => {
        const letter = 't';

        service['writeLetterInGameMap']('t', gameStub);
        expect(gameStub.mapLetterOnBoard.get(letter).value).to.equal(1);
    });

    it("writeLetterInGameMap should add a letter in the player's map", () => {
        const letter = 'a';
        service['writeLetterInGameMap']('a', gameStub);
        service['writeLetterInGameMap']('a', gameStub);
        expect(gameStub.mapLetterOnBoard.get(letter).value).to.equal(2);
    });

    it("writeLetterInGameMap should return early if letterToPut = ''", () => {
        const letter = 'a';

        service['writeLetterInGameMap']('', gameStub);
        expect(gameStub.mapLetterOnBoard.has(letter)).to.equal(false);
    });

    it("deleteLetterInStandMap should decrease or remove a letter of the player's map", () => {
        gameStub.mapLetterOnBoard.set('a', { value: 2 });
        service['deleteLetterInBoardMap']('a', gameStub);
        expect(gameStub.mapLetterOnBoard.get('a').value).to.equal(1);
    });

    it("deleteLetterInStandMap should decrease or remove a letter of the player's map", () => {
        gameStub.mapLetterOnBoard.set('a', { value: 1 });
        service['deleteLetterInBoardMap']('a', gameStub);
        expect(gameStub.mapLetterOnBoard.has('a')).to.equal(false);
    });

    it("deleteLetterInStandMap should return early if letter not in map", () => {
        service['deleteLetterInBoardMap']('b', gameStub);
        expect(gameStub.mapLetterOnBoard.has('b')).to.equal(false);
    });
});
