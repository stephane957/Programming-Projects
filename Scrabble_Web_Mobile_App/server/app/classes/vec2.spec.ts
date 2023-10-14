/* eslint-disable */
import { expect } from 'chai';
import { Vec2 } from './vec2';

describe('GameServer', () => {
    const vec2: Vec2 = new Vec2();

    it('should be created', () => {
        expect(vec2).to.be.ok;
    });
});
