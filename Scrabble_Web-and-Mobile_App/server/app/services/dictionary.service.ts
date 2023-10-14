import { DictJSON } from '@app/classes/dict-json';
import { Trie } from '@app/classes/trie';
import { Service } from 'typedi';
@Service()
export class DictionaryService {
    gameDictionary: DictJSON;

    createLexicon(trie: Trie) {
        for (const word of this.gameDictionary.words) {
            trie.add(word);
        }
        return trie;
    }

    containsWord(word: string, trie: Trie) {
        return trie.contains(this.wordFormat(word));
    }

    wordFormat(word: string): string {
        word = word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        word = word.toLowerCase();
        return word;
    }
}
