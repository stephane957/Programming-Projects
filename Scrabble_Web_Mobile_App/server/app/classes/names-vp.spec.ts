/* eslint-disable */
import { expect } from 'chai';
import { NameVP } from './names-vp';

describe('GameServer', () => {
    const nameVP: NameVP = new NameVP();

    it('should be created', () => {
        expect(nameVP).to.be.ok;
    });
});
