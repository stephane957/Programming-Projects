import { GameServer } from '@app/classes/game-server';
import { LetterData } from '@app/classes/letter-data';
import { Service } from 'typedi';

@Service()
export class LetterBankService {
    getLetterWeight(letter: string, letterBank: Map<string, LetterData>): number | undefined {
        if (letter === '') {
            return 0;
        }
        const letterUpper = letter.toUpperCase();
        return letterBank.get(letterUpper)?.weight;
    }

    giveRandomLetter(numberOfGivenLetter: number, letters: string[], letterBank: Map<string, LetterData>): string {
        let finalLetters = '';
        let randomIndex = 0;
        let letter = '';
        let letterDrawn = '';
        let letterData: LetterData | undefined = letterBank.get('A');

        for (let i = 0; i < numberOfGivenLetter; i++) {
            do {
                randomIndex = Math.floor(Math.random() * letters.length);
                letter = letters[randomIndex];
                letterData = letterBank.get(letter);
                letters.splice(randomIndex, 1);
            } while (letterData && letterData.quantity <= 0 && letter.length > 0);

            if (letterData && letterData.quantity > 0) {
                letterDrawn = this.removeLetterFromBank(letter, letterBank);
                if (letterDrawn !== '') {
                    finalLetters += letterDrawn;
                } else {
                    break;
                }
            }
        }
        return finalLetters.toLowerCase();
    }

    addLettersToBankAndArray(lettersToAdd: string, lettersArray: string[], letterBank: Map<string, LetterData>) {
        const lettersToAddUpper = lettersToAdd.toUpperCase();
        this.addLettersToArray(lettersToAddUpper, lettersArray);
        for (const letter of lettersToAddUpper) {
            const letterData = letterBank.get(letter);
            if (letterData && letterData.quantity >= 0) {
                letterData.quantity += 1;
            }
        }
    }

    getNbLettersInLetterBank(letterBank: Map<string, LetterData>): number {
        let nbLettersInMap = 0;
        let letterData: LetterData | undefined = letterBank.get('A');
        for (const key of letterBank.keys()) {
            letterData = letterBank.get(key);
            if (letterData) {
                nbLettersInMap += letterData.quantity;
            }
        }
        return nbLettersInMap;
    }

    getLettersInReserve(game: GameServer) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return Array.from(game.letterBank.keys()).filter((letter) => game.letterBank.get(letter)!.quantity > 0);
    }

    private removeLetterFromBank(letter: string, letterBank: Map<string, LetterData>): string {
        let drawnLetter = '';
        if (!letterBank.has(letter)) {
            return drawnLetter;
        }
        const letterData: LetterData | undefined = letterBank.get(letter);
        if (letterData) {
            if (letterData.quantity > 0) {
                // Js doesn't do deep copy, if we modify letterData then it modify the real value
                letterData.quantity -= 1;
                drawnLetter = letter;
            }
        }
        return drawnLetter;
    }

    private addLettersToArray(lettersToAdd: string, letters: string[]) {
        for (const letter of lettersToAdd) {
            letters.push(letter);
        }
    }
}
