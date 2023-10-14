/* eslint-disable */
import { LetterData } from '@app/classes/letter-data';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { LetterBankService } from './letter-bank.service';

describe('LetterBankService', () => {
    let service: LetterBankService;
    let letterBank: Map<string, LetterData>;
    let firstLetter: string;
    let secondLetter: string;
    let firstLetterCount: number;
    let secondLetterCount: number;
    let letters = new Map([
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

    beforeEach(() => {
        // TestBed.configureTestingModule({});
        // service = TestBed.inject(LetterBankService);
        service = new LetterBankService();
        letterBank = new Map<string, LetterData>();
        firstLetter = 'A';
        secondLetter = 'E';
        firstLetterCount = 15;
        secondLetterCount = 2;

    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('checkLetterWeight should return 0 if letter egals ""', () => {

        expect(service.checkLetterWeight('', letterBank)).equal(0);
    });

    it('checkLetterWeight should return 1 if we give him the letter a', () => {
        const letter = 'a';
        const letterUpper = letter.toUpperCase();
        letterBank.set(letterUpper, { quantity: 0, weight: 1 });
        expect(service.checkLetterWeight(letterUpper, letterBank)).equal(letters.get('A')?.weight);
    });

    it("should return an empty string if the letter bank doesn't have the letter we gave as parameter", () => {
        const letter = 'a';
        service['removeLetterFromBank'](letter, letterBank);
        expect(service['removeLetterFromBank'](letter, letterBank)).equal('');
    });

    it('should increment the count of every letter in a word given to the addLettersToBank', () => {
        // const firstLetter = 'E';
        // const secondLetter = 'T';
        // const firstLetterCount = 15;
        // const secondLetterCount = 6;
        letterBank.set(firstLetter, { quantity: firstLetterCount, weight: 1 });
        letterBank.set(secondLetter, { quantity: secondLetterCount, weight: 1 });
        const letterString = ['hello', 'wassup']
        service.addLettersToBankAndArray(firstLetter + secondLetter, letterString, letterBank);
    });

    it('should return undefined if we look for the weight of a character non existent in the letterBank', () => {
        expect(service.checkLetterWeight('!', letterBank)).to.be.undefined;
    });

    it('letter existing in the letter bank should not be undefined', () => {
        let letter = 'a';
        let letterUpper = letter.toUpperCase();
        letterBank.set(letterUpper, { quantity: 9, weight: 1 });
        expect(service.checkLetterWeight('A', letterBank)).to.not.be.undefined;
    });

    it('should remove a letter with removeLetterFromBank', () => {
        const letterToRemove = 'A';
        letterBank.set(letterToRemove, { quantity: 9, weight: 1 });
        service['letterBank'] = letters;
        const removedLetter = service['removeLetterFromBank'](letterToRemove, letterBank);
        const letterQuantity = letterBank.get(letterToRemove)?.quantity;
        expect(removedLetter).equal(letterToRemove);
        expect(letterQuantity).equal((service['letterBank'].get(removedLetter)?.quantity) - 1);
    });

    it('should initialize properly the variables when calling the giveRandomLetter() function', (done) => {
        const spy = sinon.stub(service as any, 'removeLetterFromBank')
        const numberOfLetters = 1;
        letterBank.set(firstLetter, { quantity: firstLetterCount, weight: 1 });
        letterBank.set(secondLetter, { quantity: secondLetterCount, weight: 1 });
        const letterString = ['A'];
        service.giveRandomLetter(numberOfLetters, letterString, letterBank);
        sinon.assert.called(spy);
        done();
    });

    it('should break if letterDrawn is equal to an empty string', (done) => {
        sinon.stub(service as any, 'removeLetterFromBank').returns('');
        const numberOfLetters = 1;
        letterBank.set(firstLetter, { quantity: firstLetterCount, weight: 1 });
        letterBank.set(secondLetter, { quantity: secondLetterCount, weight: 1 });
        const letterString = ['A'];
        expect(service.giveRandomLetter(numberOfLetters, letterString, letterBank)).equal('');
        done();
        sinon.stub(service as any, 'removeLetterFromBank').restore();
    });

    it('should return the amount of letters in the letter map', () => {
        letterBank.set(firstLetter, { quantity: firstLetterCount, weight: 1 });
        letterBank.set(secondLetter, { quantity: secondLetterCount, weight: 1 });
        expect(service.getNbLettersInLetterBank(letterBank)).equal(17);
    });
});
