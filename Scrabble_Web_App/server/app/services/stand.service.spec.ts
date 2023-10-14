/* eslint-disable */
import * as GlobalConstants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { LetterData } from '@app/classes/letter-data';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { LetterBankService } from './letter-bank.service';
import { StandService } from './stand.service';

describe('StandService', () => {
    let service: StandService;
    let letterBankServiceSpyObj: SinonStubbedInstance<LetterBankService>;

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
    const letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    const tileStubDefined = {
        letter: {
            value: 't',
            weight: 10,
        },
    } as Tile;

    let playerStubDefined: Player;

    beforeEach(() => {
        playerStubDefined = new Player('rayan');

        letterBankServiceSpyObj = createStubInstance(LetterBankService);

        service = new StandService(letterBankServiceSpyObj);
    });

    it('should be created', () => {
        expect(service).to.equal(service);
    });

    it('onInitStandPlayer should call initStandArray and DrawMulLetters Once', () => {
        const initStandArraySpy = sinon.stub(service as any, 'initStandArray');
        service.onInitStandPlayer(letters, letterBank, playerStubDefined);
        sinon.assert.called(initStandArraySpy);

        initStandArraySpy.restore();
    });

    it('randomExchangeVP should return t if a t is in the stand', () => {
        const giveRandomNbLetterToDeletestub = sinon.stub(service as any, 'giveRandomNbLetterToDelete').returns(1);
        const giveRandomIndexStandstub = sinon.spy(service as any, 'giveRandomIndexStand');
        giveRandomIndexStandstub.returnValues[0] = 0;
        giveRandomIndexStandstub.returnValues[1] = 1;
        const deleteLetterStandLogicstub = sinon.stub(service, 'deleteLetterStandLogic');
        const writeLetterStandLogicstub = sinon.stub(service, 'writeLetterStandLogic');

        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0].letter = new Letter();
        playerStubDefined.stand[0].letter.value = '';

        playerStubDefined.stand[1] = new Tile();
        playerStubDefined.stand[1].letter = new Letter();
        playerStubDefined.stand[1].letter.value = 't';

        playerStubDefined.stand[2] = new Tile();
        playerStubDefined.stand[2].letter = new Letter();
        playerStubDefined.stand[2].letter.value = '';

        playerStubDefined.stand[3] = new Tile();
        playerStubDefined.stand[3].letter = new Letter();
        playerStubDefined.stand[3].letter.value = '';

        playerStubDefined.stand[4] = new Tile();
        playerStubDefined.stand[4].letter = new Letter();
        playerStubDefined.stand[4].letter.value = '';

        playerStubDefined.stand[5] = new Tile();
        playerStubDefined.stand[5].letter = new Letter();
        playerStubDefined.stand[5].letter.value = '';

        playerStubDefined.stand[6] = new Tile();
        playerStubDefined.stand[6].letter = new Letter();
        playerStubDefined.stand[6].letter.value = '';

        const lettersExchanged = service.randomExchangeVP(playerStubDefined, letters, letterBank, '');
        expect(lettersExchanged).to.equal('t');

        giveRandomNbLetterToDeletestub.restore();
        giveRandomIndexStandstub.restore();
        deleteLetterStandLogicstub.restore();
        writeLetterStandLogicstub.restore();
    });

    it('giveRandomIndexStand should return a number lower than 7', () => {
        const stub = sinon.stub(Math, 'random').returns(1);
        const randomIndex = service['giveRandomIndexStand']();
        expect(randomIndex).to.be.lessThanOrEqual(GlobalConstants.NUMBER_SLOT_STAND);
        stub.restore();
    });

    it('giveRandomNbLetterToDelete should return a number lower than 8', () => {
        const lessThanValue = 8;
        const exampleLessThanValue = 7;
        const stub = sinon.stub(Math, 'random').returns(1);
        sinon.stub(service, 'checkNbLetterOnStand').returns(exampleLessThanValue);
        const randomIndex = service['giveRandomNbLetterToDelete'](playerStubDefined);
        expect(randomIndex).to.be.lessThanOrEqual(lessThanValue);
        stub.restore();
    });

    it('updateStandAfterExchange() should call putNewLetterOnStand once', () => {
        playerStubDefined.mapLetterOnStand.set('a', { value: 1 });

        const letter: Letter = new Letter();
        letter.value = 'a';

        const tile: Tile = new Tile();
        tile.letter = letter;

        playerStubDefined.stand.push(tile);

        const putNewLetterOnStandStub = sinon.stub(service, 'putNewLetterOnStand');
        service.updateStandAfterExchange('a', letters, letterBank, playerStubDefined);

        sinon.assert.calledOnce(putNewLetterOnStandStub);

        putNewLetterOnStandStub.restore();
    });

    it('updateStandAfterExchange() should call putNewLetterOnStand multiple times', () => {
        playerStubDefined.mapLetterOnStand.set('a', { value: 1 });
        playerStubDefined.mapLetterOnStand.set('b', { value: 2 });

        const letterA: Letter = new Letter();
        letterA.value = 'a';
        const tileA: Tile = new Tile();
        tileA.letter = letterA;
        playerStubDefined.stand.push(tileA);

        const letterB: Letter = new Letter();
        letterB.value = 'b';
        const tileB: Tile = new Tile();
        tileB.letter = letterB;
        playerStubDefined.stand.push(tileB);

        const letterB2: Letter = new Letter();
        letterB2.value = 'b';
        const tileB2: Tile = new Tile();
        tileB2.letter = letterB2;
        playerStubDefined.stand.push(tileB2);

        const putNewLetterOnStandStub = sinon.stub(service, 'putNewLetterOnStand');
        service.updateStandAfterExchange('abb', letters, letterBank, playerStubDefined);

        sinon.assert.calledThrice(putNewLetterOnStandStub);
    });

    it('updateStandAfterExchange() should never call putNewLetterOnStand', () => {
        const letter: Letter = new Letter();
        letter.value = 'a';
        const tile: Tile = new Tile();
        tile.letter = letter;

        playerStubDefined.stand.push(tile);

        const putNewLetterOnStandStub = sinon.stub(service, 'putNewLetterOnStand');
        service.updateStandAfterExchange('a', letters, letterBank, playerStubDefined);

        sinon.assert.notCalled(putNewLetterOnStandStub);
    });

    it('updateStandAfterExchangeWithPos() should call letterBankService.allLettersToBankAndArray()', () => {
        const deleteLetterStandLogicStub = sinon.stub(service, 'deleteLetterStandLogic').returns();
        const putNewLetterOnStandStub = sinon.stub(service, 'putNewLetterOnStand').returns();

        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0].letter = new Letter();
        playerStubDefined.stand[0].letter.value = 'a';

        service.updateStandAfterExchangeWithPos(0, playerStubDefined, ['blabla'], new Map());
        sinon.assert.called(letterBankServiceSpyObj.addLettersToBankAndArray);

        deleteLetterStandLogicStub.restore();
        putNewLetterOnStandStub.restore();
    });

    it('writeLogicOnStand should update the value and weight of the letter', () => {
        const indexTest = 0;
        playerStubDefined.stand[indexTest] = tileStubDefined;
        letterBankServiceSpyObj.checkLetterWeight.returns(1);

        service.writeLetterStandLogic(indexTest, 'a', letterBank, playerStubDefined);
        expect(playerStubDefined.stand[indexTest].letter.value).to.equal('a');
        expect(playerStubDefined.stand[indexTest].letter.weight).to.equal(1);
    });

    it("writeLogicOnStand should increment the value of defined letter 'a' if already set in map", () => {
        const indexTest = 0;
        const defaultValue = 1;
        playerStubDefined.stand[indexTest] = tileStubDefined;
        playerStubDefined.mapLetterOnStand.set('a', { value: defaultValue });

        service.writeLetterStandLogic(indexTest, 'a', letterBank, playerStubDefined);
        expect(playerStubDefined.mapLetterOnStand.get('a').value).to.equal(defaultValue + 1);
    });

    it("removeLetterStandLogic should set the letter value and weight to '' and zero for a given index", () => {
        const indexTest = 0;
        playerStubDefined.stand[indexTest] = tileStubDefined;
        playerStubDefined.mapLetterOnStand.set('a', { value: 1 });

        service.deleteLetterStandLogic('a', indexTest, playerStubDefined);
        expect(playerStubDefined.stand[indexTest].letter.value).to.equal('');
        expect(playerStubDefined.stand[indexTest].letter.weight).to.equal(0);
    });

    it('removeLetterStandLogic should remove a certain letter in map if his quantity is 1', () => {
        const indexTest = 0;
        playerStubDefined.stand[indexTest] = tileStubDefined;
        playerStubDefined.mapLetterOnStand.set('a', { value: 1 });

        service.deleteLetterStandLogic('a', indexTest, playerStubDefined);
        expect(playerStubDefined.mapLetterOnStand.get('a')).to.equal(undefined);
    });

    it('removeLetterStandLogic should remove a certain letter in map if his quantity is more than 1', () => {
        const indexTest = 0;
        playerStubDefined.stand[indexTest] = tileStubDefined;
        playerStubDefined.mapLetterOnStand.set('a', { value: 2 });

        service.deleteLetterStandLogic('a', indexTest, playerStubDefined);
        expect(playerStubDefined.mapLetterOnStand.get('a').value).to.equal(1);
    });

    it('putNewLetterOnStand should set tile.letter.value and tile.letter.weight', () => {
        const stringTest = 'a';
        const testValue = 10;
        letterBankServiceSpyObj.giveRandomLetter.returns(stringTest);
        letterBankServiceSpyObj.checkLetterWeight.returns(testValue);
        service.putNewLetterOnStand(tileStubDefined, letters, letterBank, playerStubDefined);
        expect(tileStubDefined.letter.value).to.equal(stringTest);
        expect(tileStubDefined.letter.weight).to.equal(testValue);
    });

    it('putNewLetterOnStand should call putLetterInStandMap, drawOneLetter once for a defined letter', () => {
        const putLetterInStandMapSpy = sinon.spy(service as any, 'writeLetterInStandMap');

        service.putNewLetterOnStand(tileStubDefined, letters, letterBank, playerStubDefined);
        sinon.assert.called(putLetterInStandMapSpy);
    });

    it('putNewLetterOnStand should call drawEmptyTile once for an undefined letter', () => {
        letterBankServiceSpyObj.giveRandomLetter.returns('');

        service.putNewLetterOnStand(tileStubDefined, letters, letterBank, playerStubDefined);
    });

    it("writeLetterInStandMap should add a letter in the player's map", () => {
        tileStubDefined.letter.value = 't';
        service['writeLetterInStandMap']('t', playerStubDefined);
        expect(playerStubDefined.mapLetterOnStand.get(tileStubDefined.letter.value).value).to.equal(1);

        tileStubDefined.letter.value = 'a';
        service['writeLetterInStandMap']('a', playerStubDefined);
        service['writeLetterInStandMap']('a', playerStubDefined);
        expect(playerStubDefined.mapLetterOnStand.get(tileStubDefined.letter.value).value).to.equal(2);
    });

    it("checkNbLetterOnStand should return the number of letter in the player's map", () => {
        let stringTest = '1234567';
        let numberLettersInMap: number = stringTest.length;
        service['initStandArray'](stringTest, letterBank, playerStubDefined);
        expect(service.checkNbLetterOnStand(playerStubDefined)).to.equal(numberLettersInMap);

        stringTest = '1234';
        numberLettersInMap += stringTest.length;
        service['initStandArray']('1234', letterBank, playerStubDefined);
        expect(service.checkNbLetterOnStand(playerStubDefined)).to.equal(numberLettersInMap);

        stringTest = 'mmmmmm';
        numberLettersInMap += stringTest.length;
        service['initStandArray']('mmmmmm', letterBank, playerStubDefined);
        expect(service.checkNbLetterOnStand(playerStubDefined)).to.equal(numberLettersInMap);
    });

    it("deleteLetterInStandMap should decrease or remove a letter of the player's map", () => {
        playerStubDefined.mapLetterOnStand.set('a', { value: 2 });
        service['deleteLetterInStandMap']('a', playerStubDefined);
        expect(playerStubDefined.mapLetterOnStand.get('a').value).to.equal(1);
    });

    it("deleteLetterInStandMap should decrease or remove a letter of the player's map", () => {
        playerStubDefined.mapLetterOnStand.set('a', { value: 1 });
        service['deleteLetterInStandMap']('a', playerStubDefined);
        expect(playerStubDefined.mapLetterOnStand.has('a')).to.equal(false);
    });

    it('deleteLetterArrayLogic should delete a weight to a certain tile for the player', () => {
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0] = tileStubDefined;
        service.deleteLetterArrayLogic(0, playerStubDefined);
        expect(playerStubDefined.stand[0].letter.weight).to.equal(0);
    });

    it('writeLletterArrayLogic should assign a new weight to a certain tile for the player', () => {
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0] = tileStubDefined;
        letterBankServiceSpyObj.checkLetterWeight.returns(1);
        service.writeLetterArrayLogic(0, 'a', letterBank, playerStubDefined);
        expect(playerStubDefined.stand[0].letter.weight).to.equal(1);
    });

    it('findIndexLetterInStand() should return from first if the index of a given letter in stand', () => {
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0].letter = new Letter();
        playerStubDefined.stand[0].letter.value = 't';

        const returnResult = service.findIndexLetterInStand('t', 0, playerStubDefined);
        expect(returnResult).to.equal(0);
    });

    it('findIndexLetterInStand() should return from second if the index of a given letter in stand', () => {
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0].letter = new Letter();
        playerStubDefined.stand[0].letter.value = 't';

        const returnResult = service.findIndexLetterInStand('t', 7, playerStubDefined);
        expect(returnResult).to.equal(0);
    });

    it('findIndexLetterInStand() should return -1 given letter not in stand', () => {
        playerStubDefined.stand = [
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
            tileStubDefined,
        ];
        const returnResult = service.findIndexLetterInStand('z', 0, playerStubDefined);
        expect(returnResult).to.equal(-1);
    });
});
