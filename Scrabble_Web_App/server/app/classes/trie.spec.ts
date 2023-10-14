/* eslint-disable */
import { expect } from 'chai';
import { Trie } from './trie';
import { TrieNode } from './trie-node';
import sinon = require('sinon');

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

    it("contains() should return true if node is defined and final", () => {
        let newNode = new TrieNode();
        newNode.isFinal = true;
        const getNodeStub = sinon.stub(trie, 'getNode');
        getNodeStub.returns(newNode);

        const returnValue = trie.contains('test');
        expect(returnValue).to.equal(true);

        getNodeStub.restore();
    });

    it("contains() should return false if node is defined and not final", () => {
        let newNode = new TrieNode();
        newNode.isFinal = false;
        const getNodeStub = sinon.stub(trie, 'getNode');
        getNodeStub.returns(newNode);

        const returnValue = trie.contains('test');
        expect(returnValue).to.equal(false);

        getNodeStub.restore();
    });

    it("isPrefix() should return true if node is defined", () => {
        let newNode = new TrieNode();
        newNode.isFinal = true;
        const getNodeStub = sinon.stub(trie, 'getNode');
        getNodeStub.returns(newNode);

        const returnValue = trie.isPrefix('test');
        expect(returnValue).to.equal(true);

        getNodeStub.restore();
    });

    it("isPrefix() should return false if node is undefined", () => {
        const getNodeStub = sinon.stub(trie, 'getNode');
        getNodeStub.returns(null);

        const returnValue = trie.isPrefix('test');
        expect(returnValue).to.equal(false);

        getNodeStub.restore();
    });

    it("getNode() should return null if childNodes.get(char) is undefined", () => {
        const returnValue = trie.getNode('a');
        expect(returnValue).to.equal(null);
    });

    it("getNode() should return trie.root if childs are defined", () => {
        let newNode = new TrieNode();
        newNode.isFinal = true;
        newNode.childNodes.set('a', newNode);
        trie.root = newNode;

        const returnValue = trie.getNode('a');
        expect(returnValue).to.equal(trie.root);
    });
});
