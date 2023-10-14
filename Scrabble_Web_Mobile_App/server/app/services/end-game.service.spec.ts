/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import { DatabaseService } from './database.service';
import { EndGameService } from './end-game.service';
import sinon = require('sinon');


describe('EndGameService', () => {
    // all  tested
    let service: EndGameService;
    let dataBaseServiceSpy: SinonStubbedInstance<DatabaseService>;

    const tileStubDefined = {
        letter: {
            value: 't',
            weight: 10,
        },
    } as Tile;

    let player: Player;
    let opponent: Player;
    let game: GameServer;

    beforeEach(async () => {
        player = new Player('player');
        opponent = new Player('opponent')
        game = new GameServer(1, false, 'Multi', true, '');

        dataBaseServiceSpy = createStubInstance(DatabaseService);

        service = new EndGameService(dataBaseServiceSpy);
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it("chooseWinner() should return PLAYER_WIN if player.score > opponent.score", () => {
        const countDeductedScoreSpy = spy(service as any, 'countDeductedScore');
        countDeductedScoreSpy.returnValues[0] = 1;
        countDeductedScoreSpy.returnValues[1] = 1;
        player.score = 20;
        opponent.score = 10;


        const returnValue = service.chooseWinner(game, player, opponent);
        expect(returnValue).to.equal(GlobalConstants.PLAYER_WIN)

        countDeductedScoreSpy.restore();
    });

    it("chooseWinner() should return OPPONENT_WIN if player.score < opponent.score", () => {
        const isStandEmptyBonusPointsSpy = sinon.stub(service as any, 'isStandEmptyBonusPoints');
        isStandEmptyBonusPointsSpy.returns(true);
        const countDeductedScoreSpy = spy(service as any, 'countDeductedScore');
        countDeductedScoreSpy.returnValues[0] = 1;
        countDeductedScoreSpy.returnValues[1] = 1;
        player.score = 10;
        opponent.score = 20;
        game.isLog2990Enabled = false;

        const returnValue = service.chooseWinner(game, player, opponent);
        expect(returnValue).to.equal(GlobalConstants.OPPONENT_WIN)

        countDeductedScoreSpy.restore();
        isStandEmptyBonusPointsSpy.restore();
    });

    it("chooseWinner() should return NOBODY_WIN if player.score == opponent.score", () => {
        const countDeductedScoreSpy = spy(service as any, 'countDeductedScore');
        countDeductedScoreSpy.returnValues[0] = 1;
        countDeductedScoreSpy.returnValues[1] = 1;
        player.score = 10;
        opponent.score = 10;

        const returnValue = service.chooseWinner(game, player, opponent);
        expect(returnValue).to.equal(GlobalConstants.NOBODY_WIN)

        countDeductedScoreSpy.restore();
    });

    it('should count the score to be substracted from the board of the real player with one letter', () => {
        const magicNumber = 10;
        player.stand[0] = tileStubDefined;

        expect(service['countDeductedScore'](player)).to.equal(magicNumber);
    });

    it('should count the score to be substracted from the board of the real player without letters', () => {
        expect(service['countDeductedScore'](player)).to.equal(0);
    });

    it("isStandEmptyBonusPoints() should return true if nbLettersOnStand === 0 et nbLetterReserve === 0", () => {
        player.nbLetterStand = 0;
        game.nbLetterReserve = 0;

        const returnValue = service['isStandEmptyBonusPoints'](player, game);
        expect(returnValue).to.equal(true);
    });

    it("isStandEmptyBonusPoints() should return false if nbLettersOnStand !== 0 ou nbLetterReserve !== 0", () => {
        player.nbLetterStand = 1;
        game.nbLetterReserve = 1;

        const returnValue = service['isStandEmptyBonusPoints'](player, game);
        expect(returnValue).to.equal(false);
    });

    it('should return letters still on stand', (done) => {
        const tileArray: Tile[] = [];
        // first word (horizontal)
        tileArray[0] = new Tile();
        tileArray[0].letter = new Letter();
        tileArray[0].letter.value = 'r';

        tileArray[1] = new Tile();
        tileArray[1].letter = new Letter();
        tileArray[1].letter.value = 'a';

        tileArray[2] = new Tile();
        tileArray[2].letter = new Letter();
        tileArray[2].letter.value = 'y';

        tileArray[3] = new Tile();
        tileArray[3].letter = new Letter();
        tileArray[3].letter.value = 'a';

        tileArray[4] = new Tile();
        tileArray[4].letter = new Letter();
        tileArray[4].letter.value = 'n';

        player.stand = tileArray;

        const wordArray: string[] = [];
        wordArray[0] = 'r';
        wordArray[1] = 'a';
        wordArray[2] = 'y';
        wordArray[3] = 'a';
        wordArray[4] = 'n';

        expect(service.listLetterStillOnStand(player)).to.eql(wordArray);

        done();
    });
});
