import { Tile } from '@app/classes/tile';
import { Service } from 'typedi';

const ASCII_CODE_SHIFT_CONST = 96;
const DEFAULT_POS_LAST_LETTER = -1;

@Service()
export class BoardExplorerService {
    wordArray: Tile[][] = [];
    private wordToAdd: Tile[] = [];
    private startPositionH: number[];
    private endPositionH: number[];
    private startPositionV: number[];
    private endPositionV: number[];
    private startCoordsH: number[] = [];
    private startCoordsV: number[] = [];
    private positionLastLetter = DEFAULT_POS_LAST_LETTER;
    private endPositionIndexLine = 1;
    private letterWay: string;
    private indexLine: string;
    private indexColumn: string;
    private asciiCodeShift = ASCII_CODE_SHIFT_CONST;

    getWordArray(startPosition: string, board: Tile[][]): Tile[][] {
        this.backToZero();
        this.checkSurroundings(startPosition, board);
        return this.wordArray;
    }

    formWordString(wordArray: Tile[][]): string[] {
        this.backToZero();
        const wordsList: string[] = [];
        wordArray.forEach((tileArray) => {
            let word = '';
            tileArray.forEach((tile) => {
                word += tile.letter.value;
            });
            wordsList.push(word);
        });
        return wordsList;
    }

    private backToZero() {
        this.wordArray = [];
        this.wordToAdd = [];
        this.startPositionH = [];
        this.endPositionH = [];
        this.startPositionV = [];
        this.endPositionV = [];
        this.startCoordsH = [];
        this.startCoordsV = [];
        this.letterWay = '';
        this.indexLine = '';
        this.indexColumn = '';
    }

    private checkSurroundings(startPosition: string, board: Tile[][]) {
        this.letterWay = startPosition.slice(this.positionLastLetter);
        this.indexLine = startPosition.slice(0, this.endPositionIndexLine);
        this.indexColumn = startPosition.slice(this.endPositionIndexLine, startPosition.length + this.positionLastLetter);

        this.wordToAdd = [];
        if (this.letterWay === 'v') {
            this.checkVertical(board);
        } else {
            this.checkHorizontal(board);
        }
    }

    private checkVertical(board: Tile[][]) {
        this.startCoordsV = [this.indexLine.toLowerCase().charCodeAt(0) - this.asciiCodeShift, Number(this.indexColumn)];
        this.addFirstVWord(this.startCoordsV, board);

        for (let i = 1; i <= this.endPositionV[0] - this.startPositionV[0] + 1; i++) {
            this.wordToAdd = [];

            if (!board[this.startPositionV[0] + i - 1][this.startPositionV[1]].old) {
                this.addPerpendicularWordV(i, board);
            }
        }
    }

    private addFirstVWord(startCoordsV: number[], board: Tile[][]) {
        this.startPositionV = this.isTileAbove(startCoordsV[0], startCoordsV[1], board);
        this.endPositionV = this.isTileBelow(startCoordsV[0], startCoordsV[1], board);

        // get first word that was placed
        for (let i = 0; i <= this.endPositionV[0] - this.startPositionV[0]; i++) {
            this.wordToAdd.push(board[this.startPositionV[0] + i][this.startPositionV[1]]);
        }
        this.wordArray[0] = this.wordToAdd;
    }

    private addPerpendicularWordV(index: number, board: Tile[][]) {
        const leftMostPosition = this.isTileLeft(this.startPositionV[0] + index - 1, this.startPositionV[1], board);
        const rightMostPosition = this.isTileRight(this.startPositionV[0] + index - 1, this.startPositionV[1], board);

        if (leftMostPosition[1] < this.startPositionV[1] || rightMostPosition[1] > this.startPositionV[1]) {
            for (let j = leftMostPosition[1]; j <= rightMostPosition[1]; j++) {
                this.wordToAdd.push(board[leftMostPosition[0]][j]);
            }
            this.wordArray[index] = this.wordToAdd;
        }
    }

    private checkHorizontal(board: Tile[][]) {
        this.startCoordsH = [this.indexLine.toLowerCase().charCodeAt(0) - this.asciiCodeShift, Number(this.indexColumn)];
        this.addFirstHWord(this.startCoordsH, board);

        for (let i = 1; i <= this.endPositionH[1] - this.startPositionH[1] + 1; i++) {
            this.wordToAdd = [];

            if (!board[this.startPositionH[0]][this.startPositionH[1] + i - 1].old) {
                this.addPerpendicularWordH(i, board);
            }
        }
    }

    private addFirstHWord(startCoordsH: number[], board: Tile[][]) {
        this.startPositionH = this.isTileLeft(startCoordsH[0], startCoordsH[1], board);
        this.endPositionH = this.isTileRight(startCoordsH[0], startCoordsH[1], board);

        // get first word that was placed
        for (let i = 0; i <= this.endPositionH[1] - this.startPositionH[1]; i++) {
            this.wordToAdd.push(board[this.startPositionH[0]][this.startPositionH[1] + i]);
        }
        this.wordArray[0] = this.wordToAdd;
    }

    private addPerpendicularWordH(index: number, board: Tile[][]) {
        const upMostPosition = this.isTileAbove(this.startPositionH[0], this.startPositionH[1] + index - 1, board);
        const downMostPosition = this.isTileBelow(this.startPositionH[0], this.startPositionH[1] + index - 1, board);

        if (upMostPosition[0] < this.startPositionH[0] || downMostPosition[0] > this.startPositionH[0]) {
            for (let j = upMostPosition[0]; j <= downMostPosition[0]; j++) {
                this.wordToAdd.push(board[j][upMostPosition[1]]);
            }
            this.wordArray[index] = this.wordToAdd;
        }
    }

    private isTileAbove(line: number, column: number, board: Tile[][]): number[] {
        if (line === 0) {
            return [line, column];
        }

        if (board[line - 1][column] !== undefined) {
            if (board[line - 1][column].letter.value !== '') {
                return this.isTileAbove(line - 1, column, board);
            }
        }

        return [line, column];
    }

    private isTileBelow(line: number, column: number, board: Tile[][]): number[] {
        const maxLine = 14;
        if (line === maxLine) {
            return [line, column];
        }

        if (board[line + 1][column] !== undefined) {
            if (board[line + 1][column].letter.value !== '') {
                return this.isTileBelow(line + 1, column, board);
            }
        }
        return [line, column];
    }

    private isTileLeft(line: number, column: number, board: Tile[][]): number[] {
        if (column === 0) {
            return [line, column];
        }

        if (board[line][column - 1] !== undefined) {
            if (board[line][column - 1].letter.value !== '') {
                return this.isTileLeft(line, column - 1, board);
            }
        }

        return [line, column];
    }

    private isTileRight(line: number, column: number, board: Tile[][]): number[] {
        const maxLine = 14;
        if (column === maxLine) {
            return [line, column];
        }

        if (board[line][column + 1] !== undefined) {
            if (board[line][column + 1].letter.value !== '') {
                return this.isTileRight(line, column + 1, board);
            }
        }

        return [line, column];
    }
}
