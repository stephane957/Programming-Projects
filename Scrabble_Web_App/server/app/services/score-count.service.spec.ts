/* eslint-disable */
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import { ScoreCountService } from './score-count.service';

describe('ScoreCountService', () => {
    let service: ScoreCountService;
    let player: Player;
    const magicNumber28 = 28;
    const tileArray: Tile[][] = [[], []];
    const firstWord: Tile[] = [];
    // first word (horizontal)
    firstWord[0] = new Tile();
    firstWord[0].letter = new Letter();
    firstWord[0].letter.weight = 1;
    firstWord[1] = new Tile();
    firstWord[1].letter = new Letter();
    firstWord[1].letter.weight = 1;
    firstWord[2] = new Tile();
    firstWord[2].letter = new Letter();
    firstWord[2].letter.weight = 10;
    firstWord[3] = new Tile();
    firstWord[3].letter = new Letter();
    firstWord[3].letter.weight = 1;
    firstWord[4] = new Tile();
    firstWord[4].letter = new Letter();
    firstWord[4].letter.weight = 1;

    tileArray[0] = firstWord;
    // second word (vertical)
    tileArray[1][0] = new Tile();
    tileArray[1][0].letter = new Letter();
    tileArray[1][0].letter.weight = 2;
    tileArray[1][1] = new Tile();
    tileArray[1][1].letter = new Letter();
    tileArray[1][1].letter.weight = 1;
    tileArray[1][2] = new Tile();
    tileArray[1][2].letter = new Letter();
    tileArray[1][2].letter.weight = 10;
    tileArray[1][3] = new Tile();
    tileArray[1][3].letter = new Letter();
    tileArray[1][3].letter.weight = 1;

    beforeEach(async () => {
        // await TestBed.configureTestingModule({
        //     schemas: [CUSTOM_ELEMENTS_SCHEMA],
        // });
        // service = TestBed.inject(ScoreCountService);
        service = new ScoreCountService();
        player = new Player('test');
    });

    it('should be created', () => {
        expect(service).to.equal(service);
    });

    it('should return proper bonus', () => {
        const tile = new Tile();
        tile.letter.weight = 1;

        tile.bonus = 'wordx3';
        service['computeBonus'](tile);
        expect(service['wordMultiplier']).equal(3);

        service['wordMultiplier'] = 0;

        tile.bonus = 'wordx2';
        service['computeBonus'](tile);
        expect(service['wordMultiplier']).equal(2);

        tile.bonus = 'letterx3';
        service['computeBonus'](tile);
        expect(service['letterMultiplier']).equal(3);

        service['letterMultiplier'] = 0;

        tile.bonus = 'letterx2';
        service['computeBonus'](tile);
        expect(service['letterMultiplier']).equal(2);

        service['letterMultiplier'] = 0;
        service['wordMultiplier'] = 0;

        tile.bonus = '0';
        service['computeBonus'](tile);
        expect(service['letterMultiplier']).equal(0);
        expect(service['wordMultiplier']).equal(0);
    });

    it('should return proper score for one word', () => {
        const magicNumber14 = 14;
        const magicNumber30 = 30;
        const magicNumber57 = 57;
        let score: number = service['countScore'](firstWord);
        expect(score).equal(magicNumber14);

        firstWord[0].bonus = 'letterx2';
        firstWord[2].bonus = 'wordx2';
        score = service['countScore'](firstWord);
        expect(score).equal(magicNumber30);

        const secondWord: Tile[] = [];
        secondWord[0] = new Tile();
        secondWord[0].letter = new Letter();
        secondWord[0].letter.weight = 1;
        secondWord[1] = new Tile();
        secondWord[1].letter = new Letter();
        secondWord[1].letter.weight = 1;
        secondWord[2] = new Tile();
        secondWord[2].letter = new Letter();
        secondWord[2].letter.weight = 1;
        secondWord[3] = new Tile();
        secondWord[3].letter = new Letter();
        secondWord[3].letter.weight = 1;
        secondWord[4] = new Tile();
        secondWord[4].letter = new Letter();
        secondWord[4].letter.weight = 1;
        secondWord[5] = new Tile();
        secondWord[5].letter = new Letter();
        secondWord[5].letter.weight = 1;
        secondWord[6] = new Tile();
        secondWord[6].letter = new Letter();
        secondWord[6].letter.weight = 1;

        score = service['countScore'](secondWord);
        expect(score).equal(magicNumber57);
    });

    it('should return proper score for word array for player', () => {
        firstWord[0].bonus = '0';
        firstWord[2].bonus = '0';
        const score: number = service.countScoreArray(tileArray);
        expect(score).equal(magicNumber28);

        service.updateScore(score, player);
        expect(player.score).equal(magicNumber28);
    });
});
