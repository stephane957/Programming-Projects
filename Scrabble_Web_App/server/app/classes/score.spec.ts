/* eslint-disable */
import { expect } from 'chai';
import { Score } from './score';

describe('GameServer', () => {
    const score: Score = new Score();

    it('should be created', () => {
        expect(score).to.be.ok;
    });
});
