/* eslint-disable max-lines */
import { GameServer } from '@app/classes/game-server';
import { Move } from '@app/classes/move';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Trie } from '@app/classes/trie';
import { TrieNode } from '@app/classes/trie-node';
import { Vec2 } from '@app/classes/vec2';
import { Service } from 'typedi';
import { BoardExplorerService } from './board-explorer.service';
import { ChatService } from './chat.service';
import { DebugCommandService } from './debug-command.service';
import { DictionaryService } from './dictionary.service';
import { PutLogicService } from './put-logic.service';
import { ScoreCountService } from './score-count.service';

@Service()
export class VirtualPlayerService {
    // TODO TRIE A BOUGER ABSOLUMENT (mettre la gameServer)

    private validEntries: Map<Vec2, Set<string>>;
    private direction: string;
    private anchorSquares: Vec2[];
    private moves: Move[][];
    private probability: number;

    constructor(
        protected dictService: DictionaryService,
        protected chatService: ChatService,
        protected boardExplorerService: BoardExplorerService,
        protected scoreCountService: ScoreCountService,
        protected putLogicService: PutLogicService,
        protected debugCommandService: DebugCommandService,
    ) {
        this.validEntries = new Map<Vec2, Set<string>>();
        this.direction = '';
        this.anchorSquares = new Array<Vec2>();
        this.moves = new Array<Move[]>();
        this.probability = 0;
    }

    assignMove(move: Move) {
        const maxScore = 18;
        const firstScoreInterval = 6;
        const secondScoreInterval = 13;

        if (move.score > maxScore) {
            return;
        }

        if (move.score <= firstScoreInterval) {
            if (this.moves[0] === undefined) {
                this.moves[0] = new Array<Move>();
            }
            this.moves[0].push(move);
        } else if (move.score > firstScoreInterval && move.score < secondScoreInterval) {
            if (this.moves[1] === undefined) {
                this.moves[1] = new Array<Move>();
            }
            this.moves[1].push(move);
        } else {
            if (this.moves[2] === undefined) {
                this.moves[2] = new Array<Move>();
            }
            this.moves[2].push(move);
        }
    }

    generateMoves(game: GameServer, player: Player) {
        const letterStand: string[] = [];
        for (const tile of player.stand) {
            letterStand.push(tile.letter.value);
        }

        const directions: string[] = ['horizontal', 'vertical'];
        for (const dir of directions) {
            this.direction = dir;
            this.findAnchorSquares(game.board);
            this.computeCrossChecks(game.board, game.trie);

            for (const anchorPos of this.anchorSquares) {
                if (
                    this.inBounds(this.before(anchorPos), game.board) &&
                    game.board[this.before(anchorPos).x][this.before(anchorPos).y].letter.value !== ''
                ) {
                    const partialWord = this.getPartialWord(anchorPos, game.board);
                    const currentNode = game.trie.getNode(partialWord);

                    if (currentNode !== undefined && currentNode) {
                        this.extendRight(partialWord, currentNode, anchorPos, false, game, letterStand);
                    }
                } else {
                    this.leftPart('', game.trie.root, this.getLimit(anchorPos, game.board), anchorPos, game, letterStand);
                }
            }
        }
        return this.randomPlacement(game, player);
    }

    randomPlacement(game: GameServer, player: Player) {
        const maxProbability = 100;
        const eventA = 0.3;
        const eventB = 0.7;

        this.probability = Math.floor(Math.random() * (maxProbability + 1)) / maxProbability;
        let moveToPlay: Move | undefined;

        if (this.probability < eventA && this.moves) {
            moveToPlay = this.moves[0] && this.moves[0].length > 0 ? this.moves[0][Math.floor(Math.random() * this.moves[0].length)] : undefined;
        } else if (this.probability < eventB) {
            moveToPlay = this.moves[1] && this.moves[1].length > 0 ? this.moves[1][Math.floor(Math.random() * this.moves[1].length)] : undefined;
        } else {
            moveToPlay = this.moves[2] && this.moves[2].length > 0 ? this.moves[2][Math.floor(Math.random() * this.moves[2].length)] : undefined;
        }

        this.moves[0] = [];
        this.moves[1] = [];
        this.moves[2] = [];
        // if the moveToPlay doesn't exist, VP pass his turn
        if (moveToPlay === undefined) {
            player.chatHistory.push({ message: ' Pas de solution trouvée pour cette plage de pointage', isCommand: false, sender: 'S' });
            this.chatService.passCommand('!passer', game, player); // check for deduction logic
        } else {
            this.putLogicService.computeWordVPToDraw(game, player, moveToPlay);
            this.chatService.placeCommand('!placer ' + moveToPlay.command + ' ' + moveToPlay.word, game, player);
            this.debugCommandService.debugPrint(player, moveToPlay, game);
        }
        return moveToPlay;
    }

    private before(pos: Vec2): Vec2 {
        const row = pos.x;
        const col = pos.y;
        if (this.direction === 'horizontal') {
            return { x: row, y: col - 1 };
        }
        return { x: row - 1, y: col };
    }

    private after(pos: Vec2): Vec2 {
        const row = pos.x;
        const col = pos.y;
        if (this.direction === 'horizontal') {
            return { x: row, y: col + 1 };
        }
        return { x: row + 1, y: col };
    }

    private above(pos: Vec2): Vec2 {
        const row = pos.x;
        const col = pos.y;
        if (this.direction === 'horizontal') {
            return { x: row - 1, y: col };
        }
        return { x: row, y: col - 1 };
    }

    private below(pos: Vec2): Vec2 {
        const row = pos.x;
        const col = pos.y;
        if (this.direction === 'horizontal') {
            return { x: row + 1, y: col };
        }
        return { x: row, y: col + 1 };
    }

    private inBounds(pos: Vec2, board: Tile[][]) {
        return pos.x > 0 && pos.x < board.length - 1 && pos.y > 0 && pos.y < board.length - 1;
    }

    private isAdjacent(pos: Vec2, board: Tile[][]): boolean {
        return (
            (this.inBounds(this.before(pos), board) && board[this.before(pos).x][this.before(pos).y].letter.value !== '') ||
            (this.inBounds(this.after(pos), board) && board[this.after(pos).x][this.after(pos).y].letter.value !== '') ||
            (this.inBounds(this.above(pos), board) && board[this.above(pos).x][this.above(pos).y].letter.value !== '') ||
            (this.inBounds(this.below(pos), board) && board[this.below(pos).x][this.below(pos).y].letter.value !== '')
        );
    }

    private removeLetterFromStand(letter: string, letterStand: string[]): void {
        const index = letterStand.indexOf(letter);
        const temp = letterStand[index];
        letterStand[index] = letterStand[letterStand.length - 1];
        letterStand[letterStand.length - 1] = temp;
        letterStand.pop();
    }

    private findAnchorSquares(board: Tile[][]): void {
        this.anchorSquares = new Array<Vec2>();
        for (let i = 1; i < board.length - 1; i++) {
            for (let j = 1; j < board[i].length - 1; j++) {
                const isEmpty = board[i][j].letter.value === '';
                const pos: Vec2 = { x: i, y: j };
                if (this.isAdjacent(pos, board) && isEmpty) {
                    this.anchorSquares.push(pos);
                }
            }
        }
        if (this.anchorSquares.length === 0) {
            this.anchorSquares.push({ x: 8, y: 8 });
        }
    }

    private searchValidEntries(letter: string, pos: Vec2): boolean {
        for (const [key, value] of this.validEntries.entries()) {
            if (key.x === pos.x && key.y === pos.y) {
                for (const char of value) {
                    if (char === letter) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private isInStand(letter: string, letterStand: string[]): boolean {
        for (const char of letterStand) {
            if (letter === char) {
                return true;
            }
        }
        return false;
    }

    private isInAnchorSquare(anchorPos: Vec2): boolean {
        for (const anchor of this.anchorSquares) {
            if (anchorPos.x === anchor.x && anchorPos.y === anchor.y) {
                return true;
            }
        }
        return false;
    }

    private getPrefix(pos: Vec2, board: Tile[][]) {
        let beforeLetters = '';
        let beforePos = pos;
        while (this.inBounds(this.above(beforePos), board) && board[this.above(beforePos).x][this.above(beforePos).y].letter.value !== '') {
            beforePos = this.above(beforePos);
            beforeLetters = board[beforePos.x][beforePos.y].letter.value + beforeLetters;
        }
        return beforeLetters;
    }

    private getSuffix(pos: Vec2, board: Tile[][]) {
        let afterLetters = '';
        let afterPos = pos;
        while (this.inBounds(this.below(afterPos), board) && board[this.below(afterPos).x][this.below(afterPos).y].letter.value !== '') {
            afterPos = this.below(afterPos);
            afterLetters += board[afterPos.x][afterPos.y].letter.value;
        }
        return afterLetters;
    }

    private computeCrossChecks(board: Tile[][], trie: Trie) {
        this.validEntries = new Map<Vec2, Set<string>>();
        for (let i = 1; i < board.length - 1; i++) {
            for (let j = 1; j < board[i].length - 1; j++) {
                const pos: Vec2 = { x: i, y: j };
                if (board[i][j].letter.value === '') {
                    const beforeLetters = this.getPrefix(pos, board);
                    const afterLetters = this.getSuffix(pos, board);

                    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
                    const set = new Set<string>();
                    if (beforeLetters.length === 0 && afterLetters.length === 0) {
                        for (const char of alphabet) {
                            set.add(char);
                        }
                    } else {
                        for (const char of alphabet) {
                            const word = beforeLetters + char + afterLetters;
                            if (this.dictService.containsWord(word, trie)) {
                                set.add(char);
                            }
                        }
                    }
                    this.validEntries.set(pos, set);
                }
            }
        }
        return this.validEntries;
    }

    private leftPart(
        partialWord: string,
        currentNode: TrieNode | undefined,
        limit: number,
        anchorPos: Vec2,
        game: GameServer,
        letterStand: string[],
    ): void {
        this.extendRight(partialWord, currentNode, anchorPos, false, game, letterStand);
        if (limit > 0 && currentNode) {
            for (const childNode of currentNode.childNodes) {
                if (this.isInStand(childNode[0], letterStand)) {
                    this.removeLetterFromStand(childNode[0], letterStand);
                    this.leftPart(partialWord + childNode[0], childNode[1], limit - 1, anchorPos, game, letterStand);
                    letterStand.push(childNode[0]);
                }
            }
        }
    }

    private extendRight(
        partialWord: string,
        currentNode: TrieNode | undefined,
        nextPos: Vec2,
        filled: boolean,
        game: GameServer,
        letterStand: string[],
    ): void {
        if (game.board[nextPos.x][nextPos.y].letter.value === '' && currentNode?.isFinal && filled) {
            this.addMove(this.before(nextPos), partialWord, this.direction, game, letterStand);
        }
        if (this.inBounds(nextPos, game.board)) {
            if (game.board[nextPos.x][nextPos.y].letter.value === '') {
                if (currentNode) {
                    for (const childNode of currentNode.childNodes) {
                        if (this.isInStand(childNode[0], letterStand) && this.searchValidEntries(childNode[0], nextPos)) {
                            this.removeLetterFromStand(childNode[0], letterStand);
                            const nextAnchorPos = this.after(nextPos);
                            this.extendRight(partialWord + childNode[0], childNode[1], nextAnchorPos, true, game, letterStand);
                            letterStand.push(childNode[0]);
                        }
                    }
                }
            } else {
                const letter = game.board[nextPos.x][nextPos.y].letter.value;
                if (currentNode?.childNodes.get(letter) !== undefined) {
                    this.extendRight(partialWord + letter, currentNode.childNodes.get(letter), this.after(nextPos), true, game, letterStand);
                }
            }
        }
    }

    private convertPosToCommand(pos: Vec2, direction: string) {
        let command = '';
        const asciiCodeShift = 96;
        command += String.fromCharCode(pos.x + asciiCodeShift) + pos.y.toString();
        command += direction === 'vertical' ? 'v' : 'h';
        return command;
    }

    private computeMoveScore(word: string, command: string, game: GameServer) {
        this.putLogicService.boardLogicUpdate(game, command, word);
        this.boardExplorerService.wordArray = [];
        const wordArray = this.boardExplorerService.getWordArray(command, game.board);
        const crossWords: { words: Tile[]; score: number }[] = [];
        let score = 0;
        if (wordArray) {
            for (const tileArray of wordArray) {
                if (tileArray) {
                    let wordString = '';
                    tileArray.forEach((tile) => {
                        wordString += tile.letter.value;
                    });
                    if (wordString !== word) {
                        const wordScore = this.scoreCountService.countScore(tileArray);
                        crossWords.push({ words: tileArray, score: wordScore });
                    }
                }
            }
        }
        score = this.scoreCountService.countScoreArray(wordArray);
        this.putLogicService.boardLogicRemove(game, command, word);
        return { score, crossWords };
    }

    private addMove(pos: Vec2, word: string, direction: string, game: GameServer, letterStand: string[]) {
        const temp: string[] = new Array<string>();
        for (const char of letterStand) {
            temp.push(char);
        }

        if (direction === 'vertical') {
            pos.x = pos.x - (word.length - 1);
        } else {
            pos.y = pos.y - (word.length - 1);
        }

        const command = this.convertPosToCommand(pos, direction);
        const moveData = this.computeMoveScore(word, command, game);
        const move: Move = new Move(moveData.score, command, temp, word, moveData.crossWords);
        this.assignMove(move);
    }

    private getPartialWord(pos: Vec2, board: Tile[][]) {
        let beforePos = this.before(pos);
        let partialWord = board[beforePos.x][beforePos.y].letter.value;
        while (this.inBounds(this.before(beforePos), board) && board[this.before(beforePos).x][this.before(beforePos).y].letter.value !== '') {
            beforePos = this.before(beforePos);
            partialWord = board[beforePos.x][beforePos.y].letter.value + partialWord;
        }
        return partialWord;
    }

    private getLimit(pos: Vec2, board: Tile[][]) {
        let limit = 0;
        let beforePos = pos;
        while (
            this.inBounds(this.before(beforePos), board) &&
            board[this.before(beforePos).x][this.before(beforePos).y].letter.value === '' &&
            !this.isInAnchorSquare(this.before(pos))
        ) {
            limit++;
            beforePos = this.before(beforePos);
        }
        return limit;
    }
}
