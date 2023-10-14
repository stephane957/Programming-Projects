import { Tile } from './tile';

export class Move {
    score: number;
    command: string;
    stand: string[];
    word: string;
    crossWords: { words: Tile[]; score: number }[];

    constructor(score: number, command: string, stand: string[], word: string, crossWords: { words: Tile[]; score: number }[]) {
        this.score = score;
        this.command = command;
        this.word = word;
        this.stand = stand;
        this.crossWords = crossWords;
    }
}
