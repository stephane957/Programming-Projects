/* eslint-disable */
import { expect } from 'chai';
import { LetterData } from './letter-data';

describe('GameServer', () => {
    const letterData: LetterData = new LetterData();

    it('should be created', () => {
        expect(letterData).to.be.ok;
    });
});
