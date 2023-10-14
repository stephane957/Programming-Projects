/* eslint-disable */
import { Trie } from '@app/classes/trie';
import { expect } from 'chai';
import { DictionaryService } from './dictionary.service';

describe('DictionaryService', () => {
    let service: DictionaryService;
    beforeEach(async () => {
        service = new DictionaryService();

        service.gameDictionary =
        {
            title: "titleTest",
            description: "descriptionTest",
            words: ["wordonetest", "wordtwotest"]
        }
    });

    it('should be created', (done) => {
        expect(service).to.equal(service);
        done();
    });

    it('containsWord() should return true if word is in lexicon', (done) => {
        const trie = service.createLexicon(new Trie());
        expect(service.containsWord('wordonetest', trie)).to.equal(true);
        done();
    });

    it('c9ontainsWord() should not recognize word not added to trie data structure', (done) => {
        const trie = service.createLexicon(new Trie());
        expect(service.containsWord('wordThatDoesntExist', trie)).to.equal(false);
        expect(service.containsWord('wordtwotest', trie)).to.equal(true);
        done();
    });
});
