export class TrieNode {
    isFinal: boolean;
    letter: string | undefined;
    childNodes: Map<string, TrieNode>;

    constructor(key?: string) {
        this.isFinal = false;
        this.letter = key;
        this.childNodes = new Map<string, TrieNode>();
    }
}
