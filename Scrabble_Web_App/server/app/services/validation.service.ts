import { ALPHABET } from '@app/classes/alphabet-scrabble';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Player } from '@app/classes/player';
import { Service } from 'typedi';
import { LetterBankService } from './letter-bank.service';

@Service()
export class ValidationService {
    constructor(private letterBankService: LetterBankService) {}

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
                return this.isPlaceInputValid(splitted, game);
            }
            case '!échanger': {
                const splitted: string[] = input.split(' ', 3);
                return this.isExchangeInputValid(splitted, game.letterBank, player);
            }
            default: {
                const splitted: string[] = input.split(' ', 2);
                if (splitted[1]) {
                    return 'Commande Invalide';
                }
                return '';
            }
        }
    }

    verifyPlacementOnBoard(splittedInput: string[], game: GameServer, player: Player): string {
        const position: string = splittedInput[1];
        const word: string = splittedInput[2];

        if (game.noTileOnBoard && !this.lettersTouchH8Square(word, position)) {
            return GlobalConstants.FIRST_LETTER_NOT_IN_H8;
        }

        if (!this.wordFitsBoard(word, position)) {
            return GlobalConstants.WORD_DONT_FIT_BOARD;
        }
        // Verify that the letters used are on the board or on the canvas
        if (!this.lettersAreOnBoardOrStand(word, game, player)) {
            return GlobalConstants.LETTERS_NOT_PRESENT;
        }

        if (!game.noTileOnBoard && !this.lettersHaveContactWithOthers(word, position, game)) {
            return GlobalConstants.LETTERS_MUST_TOUCH_OTHERS;
        }

        // verify that letters used from canvas are on the right place
        if (!this.areLettersUsedFromCanvasWellPlaced(word, position, game, player)) {
            return GlobalConstants.LETTERS_FROM_BOARD_WRONG;
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
            return GlobalConstants.NOT_ENOUGH_LETTERS;
        }
        if (input[2] || !input[1]) {
            return GlobalConstants.INVALID_ARGUMENTS_EXCHANGE;
        }

        for (let i = 0; i < input[1].length; i++) {
            const letterToCheck: string = lettersToExchange[i];
            const nbRepetition: number = lettersToExchange.split(lettersToExchange[i]).length - 1;
            if (!this.belongsInAlphabet(letterToCheck)) {
                return GlobalConstants.LETTER_NOT_IN_ALPHABET;
            }
            if (player.mapLetterOnStand.get(letterToCheck) === undefined) {
                return GlobalConstants.LETTER_NOT_ON_STAND;
            }
            if (player.mapLetterOnStand.get(letterToCheck).value === undefined) {
                return GlobalConstants.LETTER_NOT_ON_STAND;
            }
            if (player.mapLetterOnStand.get(letterToCheck).value < nbRepetition) {
                return GlobalConstants.LETTER_NOT_ON_STAND;
            }
        }
        return '';
    }

    private isPlaceInputValid(splittedInput: string[], game: GameServer): string {
        const position: string = splittedInput[1];
        const word: string = splittedInput[2];

        // if the command doesn't have any arguments or a valid position we return false
        if (!word || splittedInput[3] || !this.isPlacePositionValid(position)) {
            return GlobalConstants.INVALID_ARGUMENTS_PLACER;
        }

        if (game.mapLetterOnBoard.size === 0) {
            game.noTileOnBoard = true;
        }

        // verify that each letter is in the alphabet
        for (const letter of word) {
            if (!this.belongsInAlphabet(letter)) {
                return GlobalConstants.INVALID_WORD;
            }
        }
        return '';
    }

    private areLettersUsedFromCanvasWellPlaced(word: string, position: string, game: GameServer, player: Player) {
        const letterWay: string = position.slice(GlobalConstants.POSITION_LAST_LETTER);
        let indexLine: number =
            position.slice(0, GlobalConstants.END_POSITION_INDEX_LINE).toLowerCase().charCodeAt(0) - GlobalConstants.ASCII_CODE_SHIFT;
        let indexColumn = Number(position.slice(GlobalConstants.END_POSITION_INDEX_LINE, position.length + GlobalConstants.POSITION_LAST_LETTER));

        for (const letterOfWord of word) {
            // we verify that only the board has our letter
            if (game.mapLetterOnBoard.has(letterOfWord) && !player.mapLetterOnStand.has(letterOfWord)) {
                if (game.board[indexLine][indexColumn].letter.value !== letterOfWord) {
                    return false;
                }
            }
            if (letterWay === 'h') {
                indexColumn += 1;
            } else {
                indexLine += 1;
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
            const isLetterToTheSide: boolean =
                game.board[indexLine + 1][indexColumn].letter.value !== '' || game.board[indexLine - 1][indexColumn].letter.value !== '';
            const isLetterUpOrBelow: boolean =
                game.board[indexLine][indexColumn + 1].letter.value !== '' || game.board[indexLine][indexColumn - 1].letter.value !== '';
            if (isLetterUpOrBelow || isLetterToTheSide || game.board[indexLine][indexColumn].letter.value !== '') {
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

    private lettersAreOnBoardOrStand(word: string, game: GameServer, player: Player): boolean {
        for (const letter of word) {
            if (letter === '*') {
                return false;
            }
            let letterToCheck: string = letter;

            // condition that verify that its not a blank letter
            if (letter === letter.toUpperCase()) {
                letterToCheck = '*';
            }

            const doesMapStandHaveLetter = player.mapLetterOnStand.has(letterToCheck);
            const doesMapBoardHaveLetter = game.mapLetterOnBoard.has(letterToCheck);
            const nbRepetitionLetter = this.charCount(word, letterToCheck);

            switch (true) {
                case doesMapStandHaveLetter && doesMapBoardHaveLetter: {
                    if (player.mapLetterOnStand.get(letterToCheck).value + game.mapLetterOnBoard.get(letterToCheck).value < nbRepetitionLetter) {
                        return false;
                    }
                    break;
                }
                case doesMapStandHaveLetter && !doesMapBoardHaveLetter: {
                    if (player.mapLetterOnStand.get(letterToCheck).value < nbRepetitionLetter) {
                        return false;
                    }
                    break;
                }
                case !doesMapStandHaveLetter && doesMapBoardHaveLetter: {
                    if (game.mapLetterOnBoard.get(letterToCheck).value < nbRepetitionLetter) {
                        return false;
                    }
                    break;
                }
                default: {
                    return false;
                }
            }
        }
        return true;
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

    private charCount(str: string, letter: string) {
        let letterCount = 0;
        for (let position = 0; position < str.length; position++) {
            if (str.charAt(position) === letter) {
                letterCount += 1;
            }
        }
        return letterCount;
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
