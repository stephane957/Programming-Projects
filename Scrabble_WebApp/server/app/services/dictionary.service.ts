import { DictJSON } from '@app/classes/dict-json';
import { Trie } from '@app/classes/trie';
import { Service } from 'typedi';

@Service()
export class DictionaryService {
    gameDictionnary: DictJSON;
    private lexicon: Trie;

    constructor() {
        this.lexicon = new Trie();
    }

    createLexicon() {
        for (const word of this.gameDictionnary.words) {
            this.lexicon.add(word);
        }
    }

    containsWord(word: string) {
        return this.lexicon.contains(this.wordFormat(word));
    }

    wordFormat(word: string): string {
        word = word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        word = word.toLowerCase();
        return word;
    }

    getTrie() {
        return this.lexicon;
    }
}
