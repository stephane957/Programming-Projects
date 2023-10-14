import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Service } from 'typedi';

enum BonusBoard {
    WordTimes3 = 'wordx3',
    WordTimes2 = 'wordx2',
    LetterTimes3 = 'letterx3',
    LetterTimes2 = 'letterx2',
}

@Service()
export class ScoreCountService {
    private letterMultiplier: number;
    private wordMultiplier: number;

    constructor() {
        this.letterMultiplier = 0;
        this.wordMultiplier = 0;
    }

    countScoreArray(wordArray: Tile[][]): number {
        let score = 0;
        wordArray.forEach((tileArray) => {
            score += this.countScore(tileArray);
        });
        return score;
    }

    updateScore(score: number, player: Player) {
        player.score += score;
    }

    countScore(tileArray: Tile[]): number {
        let wordScore = 0;
        this.wordMultiplier = 0;

        let lengthForBonus = 0;

        tileArray.forEach((tile) => {
            this.letterMultiplier = 0;
            if (!tile.old) {
                lengthForBonus++;
                this.computeBonus(tile);
            }
            if (this.letterMultiplier > 0) {
                wordScore += (tile.letter.weight as number) * this.letterMultiplier;
                this.letterMultiplier = 0;
            } else {
                wordScore += tile.letter.weight as number;
            }
        });
        if (this.wordMultiplier > 0) {
            wordScore *= this.wordMultiplier;
            this.wordMultiplier = 0;
        }
        const tileArrayBonus = 50;
        const sizeForBonus = 7;

        if (lengthForBonus === sizeForBonus) {
            wordScore += tileArrayBonus;
        }
        return wordScore;
    }

    private computeBonus(tile: Tile) {
        switch (tile.bonus) {
            case BonusBoard.WordTimes3: {
                this.wordMultiplier += 3;
                break;
            }
            case BonusBoard.WordTimes2: {
                this.wordMultiplier += 2;
                break;
            }
            case BonusBoard.LetterTimes3: {
                this.letterMultiplier += 3;
                break;
            }
            case BonusBoard.LetterTimes2: {
                this.letterMultiplier += 2;
                break;
            }
            default: {
                break;
            }
        }
    }
}
