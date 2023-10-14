import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { LetterData } from '@app/classes/letter-data';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec4 } from '@app/classes/vec4';
import { Service } from 'typedi';
import { LetterBankService } from './letter-bank.service';

@Service()
export class StandService {
    constructor(private letterBankService: LetterBankService) {}

    onInitStandPlayer(letters: string[], letterBank: Map<string, LetterData>, player: Player) {
        const initialLetters: string | undefined = this.letterBankService.giveRandomLetter(Constants.NUMBER_SLOT_STAND, letters, letterBank);
        this.initStandArray(initialLetters, letterBank, player);
    }

    updateStandAfterExchange(lettersToExchange: string, letters: string[], letterBank: Map<string, LetterData>, player: Player) {
        for (const letter of lettersToExchange) {
            if (!player.mapLetterOnStand.has(letter)) {
                continue;
            }
            for (let j = 0; j < Constants.NUMBER_SLOT_STAND; j++) {
                if (letter === player.stand[j].letter.value) {
                    this.deleteLetterStandLogic(letter, j, player);
                    this.putNewLetterOnStand(player.stand[j], letters, letterBank, player);
                    break;
                }
            }
        }
        // we put back the letter exchange in the bank
        this.letterBankService.addLettersToBankAndArray(lettersToExchange, letters, letterBank);
    }

    updateStandAfterExchangeWithPos(position: number, player: Player, letters: string[], letterBank: Map<string, LetterData>) {
        this.deleteLetterStandLogic(player.stand[position].letter.value, position, player);
        this.putNewLetterOnStand(player.stand[position], letters, letterBank, player);
        this.letterBankService.addLettersToBankAndArray(player.stand[position].letter.value, letters, letterBank);
    }

    randomExchangeVP(player: Player, letters: string[], letterBank: Map<string, LetterData>): string {
        let lettersExchanged = '';
        const nbLettersToRemove = this.giveRandomNbLetterToDelete(player);

        // Delete the chosen letters
        for (let i = 0; i < nbLettersToRemove; i++) {
            let randomIndex = this.giveRandomIndexStand();
            let randomLetter = player.stand[randomIndex].letter.value;
            while (player.stand[randomIndex].letter.value === '') {
                randomIndex = this.giveRandomIndexStand();
                randomLetter = player.stand[randomIndex].letter.value;
            }
            this.deleteLetterStandLogic(randomLetter, randomIndex, player);
            lettersExchanged += randomLetter;
        }

        // Fills the stand with new Letters
        for (let i = 0; i < Constants.NUMBER_SLOT_STAND; i++) {
            if (player.stand[i].letter.value === '') {
                const randomLetter = this.letterBankService.giveRandomLetter(1, letters, letterBank);
                this.writeLetterStandLogic(i, randomLetter, letterBank, player);
            }
        }

        this.letterBankService.addLettersToBankAndArray(lettersExchanged, letters, letterBank);
        return lettersExchanged;
    }

    writeLetterStandLogic(indexToWrite: number, letterToWrite: string, letterBank: Map<string, LetterData>, player: Player) {
        // function to use as much as possible
        this.writeLetterArrayLogic(indexToWrite, letterToWrite, letterBank, player);
        this.writeLetterInStandMap(letterToWrite, player);
    }

    // delete ONE letter from the stand logic
    deleteLetterStandLogic(letterToRemove: string, indexToWrite: number, player: Player) {
        // function to use as much as possible
        this.deleteLetterArrayLogic(indexToWrite, player);
        this.deleteLetterInStandMap(letterToRemove, player);
    }

    // function that puts an string of letters on the stand
    // we do not care of the place of the letters on the stand
    putLettersOnStand(game: GameServer, letters: string, player: Player) {
        // loop through the letters to place
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < letters.length; i++) {
            // loop through the stand array to find an empty slot
            for (let j = 0; j < Constants.NUMBER_SLOT_STAND; j++) {
                if (player.stand[j].letter.value === '') {
                    this.writeLetterStandLogic(j, letters[i], game.letterBank, player);
                    break;
                }
            }
        }
    }

    fillEmptySlotStand(player: Player, game: GameServer) {
        for (let i = 0; i < Constants.NUMBER_SLOT_STAND; i++) {
            if (player.stand[i].letter.value === '') {
                this.putNewLetterOnStand(player.stand[i], game.letters, game.letterBank, player);
            }
        }
    }

    putNewLetterOnStand(tile: Tile, letters: string[], letterBank: Map<string, LetterData>, player: Player) {
        const newLetterToPlace = this.letterBankService.giveRandomLetter(1, letters, letterBank);
        tile.letter.value = newLetterToPlace;
        tile.letter.weight = this.letterBankService.getLetterWeight(newLetterToPlace, letterBank);

        this.writeLetterInStandMap(tile.letter.value, player);
    }

    checkNbLetterOnStand(player: Player): number {
        let nbLettersOnStand = 0;

        for (const [key] of player.mapLetterOnStand.entries()) {
            nbLettersOnStand += player.mapLetterOnStand.get(key).value;
        }

        return nbLettersOnStand;
    }

    deleteLetterArrayLogic(indexToDelete: number, player: Player) {
        player.stand[indexToDelete].letter.value = '';
        player.stand[indexToDelete].letter.weight = 0;
    }

    writeLetterArrayLogic(indexToWrite: number, letterToWrite: string, letterBank: Map<string, LetterData>, player: Player) {
        player.stand[indexToWrite].letter.value = letterToWrite;
        player.stand[indexToWrite].letter.weight = this.letterBankService.getLetterWeight(letterToWrite, letterBank);
    }

    findIndexLetterInStand(letterToSearch: string, startIndex: number, player: Player): number {
        const indexLetterToSearch = -1;
        for (let i = startIndex; i < Constants.NUMBER_SLOT_STAND; i++) {
            if (player.stand[i].letter.value === letterToSearch) {
                return i;
            }
        }
        for (let i = 0; i < startIndex; i++) {
            if (player.stand[i].letter.value === letterToSearch) {
                return i;
            }
        }
        return indexLetterToSearch;
    }

    private initStandArray(letterInit: string, letterBank: Map<string, LetterData>, player: Player) {
        const nbOccupiedSquare: number = letterInit.length;

        for (
            let i = 0, j = Constants.SIZE_OUTER_BORDER_STAND;
            i < Constants.NUMBER_SLOT_STAND;
            i++, j += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
        ) {
            const newPosition = new Vec4();
            const newTile = new Tile();
            const newLetter = new Letter();

            // Initialising the position
            newPosition.x1 = j + Constants.PADDING_BOARD_FOR_STANDS + Constants.DEFAULT_WIDTH_BOARD / 2 - Constants.DEFAULT_WIDTH_STAND / 2;
            newPosition.y1 =
                Constants.PADDING_BET_BOARD_AND_STAND +
                Constants.SIZE_OUTER_BORDER_STAND +
                Constants.PADDING_BOARD_FOR_STANDS +
                Constants.DEFAULT_WIDTH_BOARD;
            newPosition.width = Constants.WIDTH_EACH_SQUARE;
            newPosition.height = Constants.WIDTH_EACH_SQUARE;
            newTile.position = newPosition;

            // Fills the occupiedSquare
            if (i < nbOccupiedSquare) {
                newLetter.weight = this.letterBankService.getLetterWeight(letterInit[i], letterBank);
                newLetter.value = letterInit[i];

                newTile.letter = newLetter;
                newTile.bonus = '0';

                player.stand.push(newTile);
                this.writeLetterInStandMap(letterInit[i], player);
            }
            // Fills the rest
            else {
                newLetter.weight = 0;
                newLetter.value = '';

                newTile.letter = newLetter;
                newTile.bonus = '0';

                player.stand.push(newTile);
            }
        }
    }

    private giveRandomIndexStand(): number {
        const returnValue: number = Math.floor(Math.random() * Constants.NUMBER_SLOT_STAND);
        return returnValue;
    }

    private giveRandomNbLetterToDelete(player: Player): number {
        const nbLettersOnStand: number = this.checkNbLetterOnStand(player);
        const returnValue: number = Math.floor(Math.random() * nbLettersOnStand) + 1;
        return returnValue;
    }

    private writeLetterInStandMap(letterToPut: string, player: Player) {
        if (letterToPut === '') {
            return;
        }
        if (!player.mapLetterOnStand.has(letterToPut)) {
            player.mapLetterOnStand.set(letterToPut, { value: 1 });
        } else {
            player.mapLetterOnStand.get(letterToPut).value++;
        }
    }

    private deleteLetterInStandMap(letterToRemove: string, player: Player) {
        const letter = player.mapLetterOnStand.get(letterToRemove);
        if (!letter) {
            // eslint-disable-next-line no-console
            console.log('StandService:deleteLetterInStandMap letter undefined');
            return;
        }
        if (player.mapLetterOnStand.get(letterToRemove).value === 1) {
            player.mapLetterOnStand.delete(letterToRemove);
        } else {
            player.mapLetterOnStand.get(letterToRemove).value--;
        }
    }
}
