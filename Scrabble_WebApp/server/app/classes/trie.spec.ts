import { expect } from 'chai';
import { Trie } from './trie';

describe('Trie', () => {
    let trie: Trie;

    beforeEach(() => {
        trie = new Trie();
    });

    it('should be created', () => {
        expect(trie).to.be.equal(trie);
    });

    it('should return null when wrong char', () => {
        expect(trie.getNode('?')).to.be.equal(null);
    });
});
