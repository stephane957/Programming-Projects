/*eslint-disable */
import { Letter } from '@app/classes/letter';
import { Tile } from '@app/classes/tile';
import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import { BoardExplorerService } from './board-explorer.service';

const expect = chai.expect;

describe('BoardExplorerService', () => {
    let service: BoardExplorerService;

    const tileArray: Tile[][] = [[], [], [], []];
    // first word (horizontal)
    tileArray[0][0] = new Tile();
    tileArray[0][0].letter = new Letter();
    tileArray[0][0].letter.value = 'r';

    tileArray[0][1] = new Tile();
    tileArray[0][1].letter = new Letter();
    tileArray[0][1].letter.value = 'a';

    tileArray[0][2] = new Tile();
    tileArray[0][2].letter = new Letter();
    tileArray[0][2].letter.value = 'y';

    tileArray[0][3] = new Tile();
    tileArray[0][3].letter = new Letter();
    tileArray[0][3].letter.value = 'a';

    tileArray[0][4] = new Tile();
    tileArray[0][4].letter = new Letter();
    tileArray[0][4].letter.value = 'n';
    // second word (vertical)
    tileArray[1][0] = new Tile();
    tileArray[1][0].letter = new Letter();
    tileArray[1][0].letter.value = 'g';
    tileArray[1][1] = new Tile();
    tileArray[1][1].letter = new Letter();
    tileArray[1][1].letter.value = 'o';
    tileArray[1][2] = new Tile();
    tileArray[1][2].letter = new Letter();
    tileArray[1][2].letter.value = 'k';
    tileArray[1][3] = new Tile();
    tileArray[1][3].letter = new Letter();
    tileArray[1][3].letter.value = 'u';

    // third word (vertical)
    tileArray[2][0] = new Tile();
    tileArray[2][0].letter = new Letter();
    tileArray[2][0].letter.value = 'n';
    tileArray[2][1] = new Tile();
    tileArray[2][1].letter = new Letter();
    tileArray[2][1].letter.value = 'g';
    tileArray[2][2] = new Tile();
    tileArray[2][2].letter = new Letter();
    tileArray[2][2].letter.value = 'o';
    tileArray[2][3] = new Tile();
    tileArray[2][3].letter = new Letter();
    tileArray[2][3].letter.value = 'k';
    tileArray[2][4] = new Tile();
    tileArray[2][4].letter = new Letter();
    tileArray[2][4].letter.value = 'u';

    const boardArray: Tile[][] = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    // first word (horizontal)
    boardArray[1][1] = new Tile();
    boardArray[1][1].letter = new Letter();
    boardArray[1][1].letter.value = 'r';
    boardArray[1][1].old = false;

    boardArray[1][2] = new Tile();
    boardArray[1][2].letter = new Letter();
    boardArray[1][2].letter.value = 'a';
    boardArray[1][2].old = false;

    boardArray[1][3] = new Tile();
    boardArray[1][3].letter = new Letter();
    boardArray[1][3].letter.value = 'y';
    boardArray[1][3].old = false;

    boardArray[1][4] = new Tile();
    boardArray[1][4].letter = new Letter();
    boardArray[1][4].letter.value = 'a';
    boardArray[1][4].old = false;

    boardArray[1][5] = new Tile();
    boardArray[1][5].letter = new Letter();
    boardArray[1][5].letter.value = 'n';
    boardArray[1][5].old = false;

    // second word (vertical)
    boardArray[3][1] = new Tile();
    boardArray[3][1].letter = new Letter();
    boardArray[3][1].letter.value = 'g';
    boardArray[3][1].old = false;

    boardArray[4][1] = new Tile();
    boardArray[4][1].letter = new Letter();
    boardArray[4][1].letter.value = 'o';
    boardArray[4][1].old = false;

    boardArray[5][1] = new Tile();
    boardArray[5][1].letter = new Letter();
    boardArray[5][1].letter.value = 'k';
    boardArray[5][1].old = false;

    boardArray[6][1] = new Tile();
    boardArray[6][1].letter = new Letter();
    boardArray[6][1].letter.value = 'u';
    boardArray[6][1].old = false;

    // third word (horizontal)
    boardArray[1][7] = new Tile();
    boardArray[1][7].letter = new Letter();
    boardArray[1][7].letter.value = 'r';
    boardArray[1][7].old = false;

    boardArray[1][8] = new Tile();
    boardArray[1][8].letter = new Letter();
    boardArray[1][8].letter.value = 'a';
    boardArray[1][8].old = false;

    boardArray[1][9] = new Tile();
    boardArray[1][9].letter = new Letter();
    boardArray[1][9].letter.value = 'y';
    boardArray[1][9].old = false;

    boardArray[1][10] = new Tile();
    boardArray[1][10].letter = new Letter();
    boardArray[1][10].letter.value = 'a';
    boardArray[1][10].old = false;

    boardArray[1][11] = new Tile();
    boardArray[1][11].letter = new Letter();
    boardArray[1][11].letter.value = 'n';
    boardArray[1][11].old = false;

    // fourth word (vertical)
    boardArray[2][11] = new Tile();
    boardArray[2][11].letter = new Letter();
    boardArray[2][11].letter.value = 'g';
    boardArray[2][11].old = false;

    boardArray[3][11] = new Tile();
    boardArray[3][11].letter = new Letter();
    boardArray[3][11].letter.value = 'o';
    boardArray[3][11].old = false;

    boardArray[4][11] = new Tile();
    boardArray[4][11].letter = new Letter();
    boardArray[4][11].letter.value = 'k';
    boardArray[4][11].old = false;

    boardArray[5][11] = new Tile();
    boardArray[5][11].letter = new Letter();
    boardArray[5][11].letter.value = 'u';
    boardArray[5][11].old = false;
    const magicNumber = 5;
    const alsoNumber = 14;

    beforeEach(async () => {
        service = new BoardExplorerService();
    });

    it('should return string array of the words properly', (done) => {
        const wordString: string[] = service.formWordString(tileArray);
        expect(wordString[0]).to.equal('rayan');
        expect(wordString[1]).to.equal('goku');
        done();
    });

    it('should return correct word array', (done) => {
        const pos = 'a1h';
        const spy = sinon.spy(service as any, 'checkSurroundings');
        service.wordArray = tileArray;
        const wordArray: Tile[][] = service.getWordArray(pos, boardArray);
        sinon.assert.called(spy);
        // expect(service['checkSurroundings']).to.have.been.called;
        expect(wordArray[0]).to.eql(tileArray[0]);
        done();
    });

    it('should return most upper tile coordinates', (done) => {
        // line 0
        expect(service['isTileAbove'](1, 1, boardArray)[0]).to.equal(1);
        // word above
        expect(service['isTileAbove'](magicNumber, 1, boardArray)[0]).to.equal(3);
        expect(service['isTileAbove'](magicNumber, 1, boardArray)[1]).to.equal(1);
        // nothing above
        expect(service['isTileAbove'](1, magicNumber - 1, boardArray)[0]).to.equal(1);
        expect(service['isTileAbove'](1, magicNumber - 1, boardArray)[1]).to.equal(magicNumber - 1);
        done();
    });

    it('should return most down tile coordinates', (done) => {
        // line 14
        const value = 6;
        expect(service['isTileBelow'](alsoNumber, 0, boardArray)[0]).to.equal(alsoNumber);
        // word under it
        expect(service['isTileBelow'](3, 1, boardArray)[0]).to.equal(value);
        expect(service['isTileBelow'](3, 1, boardArray)[1]).to.equal(1);
        // nothing under it
        expect(service['isTileBelow'](1, magicNumber - 1, boardArray)[0]).to.equal(1);
        expect(service['isTileBelow'](1, magicNumber - 1, boardArray)[1]).to.equal(magicNumber - 1);
        done();
    });

    it('should return most left tile coordinates', (done) => {
        // column 0
        expect(service['isTileLeft'](1, 1, boardArray)[1]).to.equal(1);
        // word on the left
        expect(service['isTileLeft'](1, magicNumber, boardArray)[0]).to.equal(1);
        expect(service['isTileLeft'](1, magicNumber, boardArray)[1]).to.equal(1);
        // nothing on the left
        expect(service['isTileLeft'](magicNumber - 1, 1, boardArray)[0]).to.equal(magicNumber - 1);
        expect(service['isTileLeft'](magicNumber - 1, 1, boardArray)[1]).to.equal(1);
        done();
    });

    it('should return most right tile coordinates', (done) => {
        // column 14
        const value = 11;
        expect(service['isTileRight'](1, value, boardArray)[1]).to.equal(value);
        // word on the right
        expect(service['isTileRight'](1, 1, boardArray)[0]).to.equal(1);
        expect(service['isTileRight'](1, 1, boardArray)[1]).to.equal(magicNumber);

        // nothing on right
        expect(service['isTileRight'](1, magicNumber, boardArray)[0]).to.equal(1);
        expect(service['isTileRight'](1, magicNumber, boardArray)[1]).to.equal(magicNumber);
        done();
    });

    it('should add first vertical word', (done) => {
        service['addFirstVWord']([3, 1], boardArray);
        let word: Tile[] = [];
        word = service['wordToAdd'];

        expect(word).to.eql(tileArray[1]);
        done();
    });

    it('should add first horizontal word', (done) => {
        service['addFirstHWord']([1, 1], boardArray);
        let word: Tile[] = [];
        word = service['wordToAdd'];

        expect(word).to.eql(tileArray[0]);
        done();
    });

    it('should call correct function for certain letterWay', (done) => {
        const pos1 = 'a1h';
        const spy = sinon.spy(service as any, 'checkHorizontal');
        service['checkSurroundings'](pos1, boardArray);
        sinon.assert.called(spy);

        const pos2 = 'a1v';
        const spy2 = sinon.spy(service as any, 'checkVertical');
        service['checkSurroundings'](pos2, boardArray);
        sinon.assert.called(spy2);
        done();
    });

    it('should add correct vertical word to wordArray', (done) => {
        const pos: number[] = [3, 1];
        service['addFirstVWord'](pos, boardArray);
        expect(service.wordArray[0]).to.eql(tileArray[1]);
        done();
    });

    it('should add correct horizontal word to wordArray', (done) => {
        const pos: number[] = [1, 1];
        service['addFirstHWord'](pos, boardArray);
        expect(service.wordArray[0]).to.eql(tileArray[0]);
        done();
    });

    it('should add correct perpendicular word (base word is horizontal)', (done) => {
        const value = 11;
        const index = 1;
        service['startPositionH'] = [1, value];
        service['addPerpendicularWordH'](index, boardArray);
        expect(service.wordArray[index]).to.eql(tileArray[2]);
        done();
    });

    it('should add correct perpendicular word (base word is vertical)', (done) => {
        const value = 11;
        const index = 1;
        service['startPositionV'] = [1, value];
        service['addPerpendicularWordV'](index, boardArray);
        expect(service.wordArray[index]).to.eql(tileArray[0]);
        done();
    });

    //     /*
    //         CODE COVERAGE = 89.13%
    //         Les deux cas en dessous ne fonctionnent pas car service['checkHorizontal']() appelle addPerpendicularWordH meme si
    //         un sinon.spy est dessus. Je ne suis pas arrive a le faire fonctionner malgres mes recherches...
    //         je demanderais au prof ou aux charges de l'aide a la prochaine sceance, il faut s'occuper du reste
    //     */

    it('should call addFirstHWord regardless and addPerpendicularWordH if condition is met', (done) => {
        const spy = sinon.spy(service as any, 'addFirstHWord');
        const spy2 = sinon.spy(service as any, 'addPerpendicularWordH');
        const pos = 'a1h';

        service['indexLine'] = pos.slice(0, 1);
        // service.asciiCodeShift;
        service['indexColumn'] = pos.slice(1, pos.length - 1);

        service['startPositionH'] = [0, 0];
        service['endPositionH'] = [0, 2];

        service['checkHorizontal'](boardArray);
        sinon.assert.called(spy);
        sinon.assert.called(spy2);

        done();
    });

    it('should call addFirstVWord regardless and addPerpendicularWordV if condition is met', (done) => {
        const spy = sinon.spy(service as any, 'addFirstVWord');
        const spy2 = sinon.spy(service as any, 'addPerpendicularWordV');

        const pos = 'c1v';

        service['indexLine'] = pos.slice(0, 1);
        // service.asciiCodeShift;
        service['indexColumn'] = pos.slice(1, pos.length - 1);
        service['startPositionV'] = [2, 0];
        service['endPositionV'] = [magicNumber - 1, 0];

        service['checkVertical'](boardArray);
        sinon.assert.called(spy);
        sinon.assert.called(spy2);

        done();
    });
});
