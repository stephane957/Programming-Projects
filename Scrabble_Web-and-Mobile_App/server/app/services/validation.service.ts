import { ALPHABET } from '@app/classes/alphabet-scrabble';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Player } from '@app/classes/player';
import { Vec2 } from '@app/classes/vec2';
import { Service } from 'typedi';
import { BoardService } from './board.service';
import { LetterBankService } from './letter-bank.service';
import { TranslateService } from '@app/services/translate.service';

@Service()
export class ValidationService {
    constructor(private letterBankService: LetterBankService, private boardService: BoardService, private translateService: TranslateService) {}

    entryIsTooLong(input: string): boolean {
        // verify that the entry of the user isn't longer thant 512 characters
        return input.length > GlobalConstants.INPUT_MAX_LENGTH;
    }

    isCommandValid(input: string): boolean {
        // verify that the command is valid
        const command: string = input.split(' ', 1)[0];
        const isCommand: boolean =
            command === '!passer' ||
            command === '!placer' ||
            command === '!debug' ||
            command === '!reserve' ||
            command === '!aide' ||
            command === '!échanger';
        return isCommand;
    }

    syntaxIsValid(input: string, game: GameServer, player: Player): string {
        // verify that the command is valid
        const command = input.split(' ')[0];
        switch (command) {
            case '!placer': {
                const splitted: string[] = input.split(' ', 3);
                return this.isPlaceInputValid(splitted, game, player);
            }
            case '!échanger': {
                const splitted: string[] = input.split(' ', 3);
                return this.isExchangeInputValid(splitted, game.letterBank, player);
            }
            default: {
                const splitted: string[] = input.split(' ', 2);
                if (splitted[1]) {
                    return this.translateService.translateMessage(player.name, 'INVALID_COMMAND');
                }
                return '';
            }
        }
    }

    verifyPlacementOnBoard(splittedInput: string[], game: GameServer, player: Player): string {
        const position: string = splittedInput[1];
        const word: string = splittedInput[2];

        if (game.noTileOnBoard && !this.lettersTouchH8Square(word, position)) {
            return this.translateService.translateMessage(player.name, 'FIRST_LETTER_NOT_IN_H8');
        }

        if (!this.wordFitsBoard(word, position)) {
            return this.translateService.translateMessage(player.name, 'WORD_DONT_FIT_BOARD');
        }

        // verifies that the word touches at least one letter of the board
        if (!game.noTileOnBoard && !this.lettersHaveContactWithOthers(word, position, game)) {
            return this.translateService.translateMessage(player.name, 'LETTERS_MUST_TOUCH_OTHERS');
        }

        // verify that the temporary letters are touching each other in case
        // there is no tile beetween them
        if (!this.tmpLettersTouchEachOther(game, position)) {
            return this.translateService.translateMessage(player.name, 'TMP_LETTERS_MUST_TOUCH');
        }

        return '';
    }

    reserveIsEmpty(letterBank: Map<string, LetterData>): boolean {
        return this.letterBankService.getNbLettersInLetterBank(letterBank) === 0;
    }
    standEmpty(player: Player): boolean {
        return player.stand.length === 0;
    }

    private isExchangeInputValid(input: string[], letterBank: Map<string, LetterData>, player: Player): string {
        const lettersToExchange: string = input[1];
        if (this.letterBankService.getNbLettersInLetterBank(letterBank) < GlobalConstants.DEFAULT_NB_LETTER_STAND) {
            return this.translateService.translateMessage(player.name, 'NOT_ENOUGH_LETTERS');
        }
        if (input[2] || !input[1]) {
            return this.translateService.translateMessage(player.name, 'INVALID_ARGUMENTS_EXCHANGE');
        }

        for (let i = 0; i < input[1].length; i++) {
            const letterToCheck: string = lettersToExchange[i];
            const nbRepetition: number = lettersToExchange.split(lettersToExchange[i]).length - 1;
            if (!this.belongsInAlphabet(letterToCheck)) {
                return this.translateService.translateMessage(player.name, 'LETTER_NOT_IN_ALPHABET');
            }
            if (player.mapLetterOnStand.get(letterToCheck) === undefined) {
                return this.translateService.translateMessage(player.name, 'LETTER_NOT_ON_STAND');
            }
            if (player.mapLetterOnStand.get(letterToCheck).value === undefined) {
                return this.translateService.translateMessage(player.name, 'LETTER_NOT_ON_STAND');
            }
            if (player.mapLetterOnStand.get(letterToCheck).value < nbRepetition) {
                return this.translateService.translateMessage(player.name, 'LETTER_NOT_ON_STAND');
            }
        }
        return '';
    }

    private isPlaceInputValid(splittedInput: string[], game: GameServer, player: Player): string {
        const position: string = splittedInput[1];
        const word: string = splittedInput[2];

        // if the command doesn't have any arguments or a valid position we return false
        if (!word || splittedInput[3] || !this.isPlacePositionValid(position)) {
            return this.translateService.translateMessage(player.name, 'INVALID_ARGUMENTS_PLACER');
        }

        if (game.mapLetterOnBoard.size === 0) {
            game.noTileOnBoard = true;
        }

        // verify that each letter is in the alphabet
        for (const letter of word) {
            if (!this.belongsInAlphabet(letter)) {
                return this.translateService.translateMessage(player.name, 'INVALID_WORD');
            }
        }
        return '';
    }

    private tmpLettersTouchEachOther(game: GameServer, position: string): boolean {
        const letterWay: string = position.slice(GlobalConstants.POSITION_LAST_LETTER);
        const idxsTmpLetters: Vec2[] = this.boardService.getIdxsTmpLetters(game);

        // NEW FUNCTION
        for (let i = 0; i < idxsTmpLetters.length - 1; i++) {
            if (letterWay === 'h') {
                if (
                    idxsTmpLetters[i].y + 1 !== idxsTmpLetters[i + 1].y &&
                    game.board[idxsTmpLetters[i].x][idxsTmpLetters[i].y + 1].letter.value === ''
                ) {
                    return false;
                }
            } else {
                if (
                    idxsTmpLetters[i].x + 1 !== idxsTmpLetters[i + 1].x &&
                    game.board[idxsTmpLetters[i].x + 1][idxsTmpLetters[i].y].letter.value === ''
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    private wordFitsBoard(word: string, position: string): boolean {
        const letterWay: string = position.slice(GlobalConstants.POSITION_LAST_LETTER);
        const indexLine: number =
            position.slice(0, GlobalConstants.END_POSITION_INDEX_LINE).toLowerCase().charCodeAt(0) - GlobalConstants.ASCII_CODE_SHIFT - 1;
        const indexColumn =
            Number(position.slice(GlobalConstants.END_POSITION_INDEX_LINE, position.length + GlobalConstants.POSITION_LAST_LETTER)) - 1;

        if (letterWay === 'h') {
            if (indexColumn + Number(word.length) > GlobalConstants.NUMBER_SQUARE_H_AND_W) return false;
        } else {
            if (indexLine + Number(word.length) > GlobalConstants.NUMBER_SQUARE_H_AND_W) return false;
        }
        return true;
    }

    private isPlacePositionValid(position: string): boolean {
        const lengthDoubleCharColumnInput = 4;
        // concatenation of the conditions of validity of a boolean entry
        if (position.length === 3) {
            return this.isLineValid(position[0]) && this.isSingleDigitColumnValid(position[1]) && this.isOrientationValid(position[2]);
        } else if (position.length === lengthDoubleCharColumnInput) {
            return this.isLineValid(position[0]) && this.isDoubleDigitColumnValid(position[1], position[2]) && this.isOrientationValid(position[3]);
        }
        return false;
    }

    private lettersTouchH8Square(word: string, position: string): boolean {
        const letterWay: string = position.slice(GlobalConstants.POSITION_LAST_LETTER);
        let indexLine: number =
            position.slice(0, GlobalConstants.END_POSITION_INDEX_LINE).toLowerCase().charCodeAt(0) - GlobalConstants.ASCII_CODE_SHIFT;
        let indexColumn = Number(position.slice(GlobalConstants.END_POSITION_INDEX_LINE, position.length + GlobalConstants.POSITION_LAST_LETTER));
        const positionH8Square = 8;

        // we dont use the variable i so we cant replace this 'for' for a 'for of' otherwise the compilator will say the variable isnt used
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < word.length; i++) {
            if (indexColumn === positionH8Square && indexLine === positionH8Square) {
                return true;
            }

            if (letterWay === 'h') {
                indexColumn += 1;
            } else {
                indexLine += 1;
            }
        }
        return false;
    }

    private lettersHaveContactWithOthers(word: string, position: string, game: GameServer): boolean {
        const letterWay: string = position.slice(GlobalConstants.POSITION_LAST_LETTER);
        let indexLine: number =
            position.slice(0, GlobalConstants.END_POSITION_INDEX_LINE).toLowerCase().charCodeAt(0) - GlobalConstants.ASCII_CODE_SHIFT;
        let indexColumn = Number(position.slice(GlobalConstants.END_POSITION_INDEX_LINE, position.length + GlobalConstants.POSITION_LAST_LETTER));

        // we dont use the variable i so we cant replace this 'for' for a 'for of' otherwise the compilator will say the variable isnt used
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < word.length; i++) {
            const upTile = game.board[indexLine - 1][indexColumn];
            const downTile = game.board[indexLine + 1][indexColumn];
            const leftTile = game.board[indexLine][indexColumn - 1];
            const rightTile = game.board[indexLine][indexColumn + 1];
            // store the letter but doesn't take the temporary one
            const upLetter = upTile.borderColor !== '#ffaaff' ? upTile.letter.value : '';
            const downLetter = downTile.borderColor !== '#ffaaff' ? downTile.letter.value : '';
            const leftLetter = leftTile.borderColor !== '#ffaaff' ? leftTile.letter.value : '';
            const rightLetter = rightTile.borderColor !== '#ffaaff' ? rightTile.letter.value : '';

            const isLetterUpOrBelow: boolean = downLetter !== '' || upLetter !== '';
            const isLetterToTheSide: boolean = rightLetter !== '' || leftLetter !== '';
            if (isLetterUpOrBelow || isLetterToTheSide) {
                return true;
            }
            if (letterWay === 'h') {
                indexColumn += 1;
            } else {
                indexLine += 1;
            }
        }
        return false;
    }

    // check if the letter in param is in the alphabet
    private belongsInAlphabet(letter: string): boolean {
        for (const character of ALPHABET) {
            if (character === letter.toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    // if the line is a 0 < number < 9
    private isSingleDigitColumnValid(line: string): boolean {
        return line >= '1' && line <= '9';
    }

    // check if the column is compromised between a and o
    private isLineValid(col: string): boolean {
        return col >= 'a' && col <= 'o';
    }

    // if the line is a number it must be between 1 and 15
    private isDoubleDigitColumnValid(firstDigit: string, secondDigit: string): boolean {
        return firstDigit === '1' && secondDigit >= '0' && secondDigit <= '5';
    }

    // check if the orientation of the letter is horizontal 'h' or vertical 'v'
    private isOrientationValid(orientation: string): boolean {
        return orientation === 'h' || orientation === 'v';
    }
}
