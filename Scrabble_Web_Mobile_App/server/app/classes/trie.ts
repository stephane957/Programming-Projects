import { TrieNode } from './trie-node';

export class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    add(word: string) {
        let currentNode = this.root;
        for (const char of word) {
            if (!currentNode.childNodes.get(char)) {
                currentNode.childNodes.set(char, new TrieNode());
            }
            const dataNode = currentNode.childNodes.get(char);
            if (dataNode) {
                currentNode = dataNode;
            }
        }
        currentNode.isFinal = true;
    }

    contains(word: string): boolean {
        const node = this.getNode(word);
        return node && node.isFinal ? true : false;
    }

    isPrefix(prefix: string): boolean {
        const node = this.getNode(prefix);
        return node ? true : false;
    }

    getNode(word: string): TrieNode | null {
        let currentNode = this.root;
        for (const char of word) {
            if (currentNode.childNodes.get(char) === undefined) {
                return null;
            }
            const dataNode = currentNode.childNodes.get(char);
            if (dataNode) {
                currentNode = dataNode;
            }
        }
        return currentNode ? currentNode : null;
    }
}
