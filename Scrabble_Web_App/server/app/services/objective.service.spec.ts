/*eslint-disable*/
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Objective } from '@app/classes/objective';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BoardExplorerService } from './board-explorer.service';
import { ObjectiveService } from './objective.service';
import Sinon = require('sinon');

describe('ObjectiveService', () => {
    let service: ObjectiveService;
    let boardExplorerSpy: SinonStubbedInstance<BoardExplorerService>;

    let playerStubDefined: Player;
    let gameStubDefined: GameServer;

    beforeEach(() => {
        playerStubDefined = new Player('Joe');
        gameStubDefined = new GameServer(1, false, 'Multi', true, '');

        boardExplorerSpy = createStubInstance(BoardExplorerService);

        service = new ObjectiveService(boardExplorerSpy);
    });

    it('should be created', () => {
        expect(service).to.equal(service);
    });

    it('checkIfObjective0Completed should not add 10 points to the player if the command is !passer', () => {
        let newObjectif = new Objective(10, 'Ne pas échanger ou passer pendant les trois premiers tours.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 0);
        newObjectif.playerId = 'notPublic';
        gameStubDefined.objectivesOfGame[0] = newObjectif;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective0Completed'](gameStubDefined, playerStubDefined, '!passer');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it('checkIfObjective0Completed should not add 10 points to the player if the command is !échanger and private', () => {
        gameStubDefined.objectivesOfGame[0] =
            new Objective(10, 'Ne pas échanger ou passer pendant les trois premiers tours.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 0);

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective0Completed'](gameStubDefined, playerStubDefined, '!échanger');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it('checkIfObjective0Completed should not add 10 points to the player if the command is !échanger and public', () => {
        let newObjectif = new Objective(10, 'Ne pas échanger ou passer pendant les trois premiers tours.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 0);
        newObjectif.playerId = 'public';
        newObjectif.failedFor.push("player1");
        gameStubDefined.objectivesOfGame[0] = newObjectif;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective0Completed'](gameStubDefined, playerStubDefined, '!échanger');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it("checkIfObjective0Completed should not add 10 points to the player if the objectif isn't for the player concerned", () => {
        const objectiveTest = new Objective(
            10,
            'Ne pas échanger ou passer pendant les trois premiers tours.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            0,
        );
        objectiveTest.playerId = 'idObj';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.idPlayer = 'idPlayer';

        service['checkIfObjective0Completed'](gameStubDefined, playerStubDefined, '!placer');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it("checkIfObjective0Completed should add 10 points to the player the player didn't exchange or pass in the first 3 turns", () => {
        const objectiveTest = new Objective(
            10,
            'Ne pas échanger ou passer pendant les trois premiers tours.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            0,
        );
        objectiveTest.playerId = 'public';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.turn = 4;

        service['checkIfObjective0Completed'](gameStubDefined, playerStubDefined, '!autre');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore + objectiveTest.points);
    });

    it("checkIfObjective1Completed should not add 15 points to the player if the objectif isn't for the player concerned ", () => {
        const objectiveTest = new Objective(
            15,
            'Placer un mot avec au moins 3 fois la même lettre sans utiliser de lettre blanche.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            1,
        );
        // objectiveTest.isPublic = false;
        objectiveTest.playerId = 'idObj';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.idPlayer = 'idPlayer';

        service['checkIfObjective1Completed'](gameStubDefined, playerStubDefined, 'abracadabra');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it('checkIfObjective1Completed should add 15 points to the player if there is 3 time the same letter in the word given in parameter ', () => {
        const objectiveTest = new Objective(
            15,
            'Placer un mot avec au moins 3 fois la même lettre sans utiliser de lettre blanche.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            1,
        );
        objectiveTest.playerId = 'public';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective1Completed'](gameStubDefined, playerStubDefined, 'Aaracadabra');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore + objectiveTest.points);
    });

    it("checkIfObjective2Completed should not add 20 points to the player if the objectif isn't for the player concerned ", () => {
        const objectiveTest = new Objective(
            20,
            "Placer consécutivement deux fois le même mot d'au moins 5 points.",
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            2,
        );
        // objectiveTest.isPublic = false;
        objectiveTest.playerId = 'idObj';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.idPlayer = 'idPlayer';

        service['checkIfObjective2Completed'](gameStubDefined, playerStubDefined, 'abracadabra');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it('checkIfObjective2Completed should add 20 points to the player if the same word is placed two consecutive time ', () => {
        const objectiveTest = new Objective(
            20,
            "Placer consécutivement deux fois le même mot d'au moins 5 points.",
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            2,
        );
        objectiveTest.playerId = 'public';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const newWord = 'allo';
        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.lastWordPlaced = newWord;

        service['checkIfObjective2Completed'](gameStubDefined, playerStubDefined, newWord);
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore + objectiveTest.points);
    });

    it("checkIfObjective3Completed should not add 15 points to the player if the objectif isn't for the player concerned ", () => {
        const objectiveTest = new Objective(15, 'Placer un mot avec plus de voyelles que de consonnes.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 3);
        // objectiveTest.isPublic = false;
        objectiveTest.playerId = 'idObj';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.idPlayer = 'idPlayer';

        service['checkIfObjective3Completed'](gameStubDefined, playerStubDefined, 'abracadabra');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it('checkIfObjective3Completed should add 15 points to the player if word contains more vowel than consonant', () => {
        const objectiveTest = new Objective(15, 'Placer un mot avec plus de voyelles que de consonnes.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 3);
        objectiveTest.playerId = 'public';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective3Completed'](gameStubDefined, playerStubDefined, 'ete');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore + objectiveTest.points);
    });

    it('checkIfObjective3Completed should not add 15 points to the player if vowels variables is null', () => {
        const objectiveTest = new Objective(15, 'Placer un mot avec plus de voyelles que de consonnes.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 3);
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective3Completed'](gameStubDefined, playerStubDefined, 'été');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it("checkIfObjective4Completed should not add 15 points to the player if the objectif isn't for the player concerned", () => {
        const objectiveTest = new Objective(
            15,
            'Ne pas utiliser la lettre e ou a dans les 2 premiers tours.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            4,
        );
        // objectiveTest.isPublic = false;
        objectiveTest.playerId = 'idObj';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.idPlayer = 'idPlayer';

        service['checkIfObjective4Completed'](gameStubDefined, playerStubDefined, ['!placer', 'h8h', 'abracadabra']);
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it("checkIfObjective4Completed should not add 15 points to the player if the letters exchanged contains a 'a' or an 'e' in the first 2 turn", () => {
        const objectiveTest = new Objective(
            15,
            'Ne pas utiliser la lettre e ou a dans les 2 premiers tours.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            4,
        );
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective4Completed'](gameStubDefined, playerStubDefined, ['!échanger', 'abracadabra']);
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it("checkIfObjective4Completed should not add 15 points to the player if the word placed contains a 'a' or an 'e' in the first 2 turn", () => {
        const objectiveTest = new Objective(
            15,
            'Ne pas utiliser la lettre e ou a dans les 2 premiers tours.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            4,
        );
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective4Completed'](gameStubDefined, playerStubDefined, ['!placer', 'h8h', 'abracadabra']);
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });


    it("checkIfObjective4Completed should not add 15 points to the player if the word placed contains a 'a' or an 'e' in the first 2 turn", () => {
        const objectiveTest = new Objective(
            15,
            'Ne pas utiliser la lettre e ou a dans les 2 premiers tours.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            4,
        );
        objectiveTest.playerId = 'public';
        objectiveTest.failedFor.push("player1");
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective4Completed'](gameStubDefined, playerStubDefined, ['!placer', 'h8h', 'abracadabra']);
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it("checkIfObjective4Completed should not add 15 points to the player if the word placed contains a 'a' or an 'e' in the first 2 turn", () => {
        const objectiveTest = new Objective(
            15,
            'Ne pas utiliser la lettre e ou a dans les 2 premiers tours.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            4,
        );
        objectiveTest.playerId = 'public';
        objectiveTest.failedFor.push("player1");
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective4Completed'](gameStubDefined, playerStubDefined, ['!placer', 'h8h', 'ebrecedebre']);
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it("checkIfObjective4Completed should add 15 points to the player if the word placed doesn't contains a 'a' or an 'e' in the first 2 turn", () => {
        const objectiveTest = new Objective(
            15,
            'Ne pas utiliser la lettre e ou a dans les 2 premiers tours.',
            GlobalConstants.UNCOMPLETED_OBJECTIVE,
            4,
        );
        objectiveTest.playerId = 'public';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.turn = 3;

        service['checkIfObjective4Completed'](gameStubDefined, playerStubDefined, ['!placer', 'h8h', 'dibodibodibo']);
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore + objectiveTest.points);
    });

    it("checkIfObjective5Completed should not add 30 points to the player if the objectif isn't for the player concerned", () => {
        const objectiveTest = new Objective(30, 'Placer un mot qui crée au moins 3 mots.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 5);
        // objectiveTest.isPublic = false;
        objectiveTest.playerId = 'idObj';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.idPlayer = 'idPlayer';

        service['checkIfObjective5Completed'](gameStubDefined, playerStubDefined, 'abracadabra');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it('checkIfObjective5Completed should add 30 points to the player if the player placed a word that created 3 words in total', () => {
        const objectiveTest = new Objective(30, 'Placer un mot qui crée au moins 3 mots.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 5);
        objectiveTest.playerId = 'public';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;
        boardExplorerSpy.getWordArray.returns([
            [{ color: '8431' } as Tile, { color: '8431' } as Tile],
            [{ color: '8431' } as Tile],
            [{ color: '8431' } as Tile],
        ]);

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective5Completed'](gameStubDefined, playerStubDefined, 'abracadabra');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore + objectiveTest.points);

        boardExplorerSpy.getWordArray.restore();
    });

    it("checkIfObjective6Completed should not add 15 points to the player if the objectif isn't for the player concerned", () => {
        const objectiveTest = new Objective(15, "Former un mot d'au moins 8 lettres.", GlobalConstants.UNCOMPLETED_OBJECTIVE, 6);
        // objectiveTest.isPublic = false;
        objectiveTest.playerId = 'idObj';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.idPlayer = 'idPlayer';

        service['checkIfObjective6Completed'](gameStubDefined, playerStubDefined, 'abracadabra');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it('checkIfObjective6Completed should add 15 points to the player if the word placed is more than 8 letters', () => {
        const objectiveTest = new Objective(15, "Former un mot d'au moins 8 lettres.", GlobalConstants.UNCOMPLETED_OBJECTIVE, 6);
        objectiveTest.playerId = 'public';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;

        service['checkIfObjective6Completed'](gameStubDefined, playerStubDefined, 'abracadabra');
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore + objectiveTest.points);
    });

    it("checkIfObjective7Completed should not add 40 points to the player if the objectif isn't for the player concerned", () => {
        const objectiveTest = new Objective(40, 'Faire un bingo après avoir échangé toutes ses lettres.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 7);
        // objectiveTest.isPublic = false;
        objectiveTest.playerId = 'idObj';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.idPlayer = 'idPlayer';

        service['checkIfObjective7Completed'](gameStubDefined, playerStubDefined);
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore);
    });

    it('checkIfObjective7Completed should add 40 points to the player if the word placed is a bingo after exchanging all his letter', () => {
        const objectiveTest = new Objective(40, 'Faire un bingo après avoir échangé toutes ses lettres.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 7);
        objectiveTest.playerId = 'public';
        gameStubDefined.objectivesOfGame[0] = objectiveTest;

        const oldPlayerScore = 10;
        playerStubDefined.score = oldPlayerScore;
        playerStubDefined.isMoveBingo = true;
        playerStubDefined.allLetterSwapped = true;

        service['checkIfObjective7Completed'](gameStubDefined, playerStubDefined);
        expect(playerStubDefined.score).to.be.equal(oldPlayerScore + objectiveTest.points);
    });

    it('isPlayerObjectivesCompleted should call all the function for the objectives in the variable objectivesOfGame', () => {
        gameStubDefined.objectivesOfGame[0] =
            new Objective(10, 'Ne pas échanger ou passer pendant les trois premiers tours.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 0);
        gameStubDefined.objectivesOfGame[1] =
            new Objective(
                15,
                'Placer un mot avec au moins 3 fois la même lettre sans utiliser de lettre blanche.',
                GlobalConstants.UNCOMPLETED_OBJECTIVE,
                1,
            );
        gameStubDefined.objectivesOfGame[2] =
            new Objective(20, "Placer consécutivement deux fois le même mot d'au moins 5 points.", GlobalConstants.UNCOMPLETED_OBJECTIVE, 2);
        gameStubDefined.objectivesOfGame[3] =
            new Objective(15, 'Placer un mot avec plus de voyelles que de consonnes.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 3);
        gameStubDefined.objectivesOfGame[4] =
            new Objective(15, 'Ne pas utiliser la lettre e ou a dans les 2 premiers tours.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 4);
        gameStubDefined.objectivesOfGame[5] = new Objective(30, 'Placer un mot qui crée au moins 3 mots.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 5);
        gameStubDefined.objectivesOfGame[6] = new Objective(15, "Former un mot d'au moins 8 lettres.", GlobalConstants.UNCOMPLETED_OBJECTIVE, 6);
        gameStubDefined.objectivesOfGame[7] =
            new Objective(40, 'Faire un bingo après avoir échangé toutes ses lettres.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 7);
        gameStubDefined.objectivesOfGame[8] = new Objective(1000000, 'RANDOM RANDOM', GlobalConstants.UNCOMPLETED_OBJECTIVE, 8);

        gameStubDefined.objectivesOfGame[9] = new Objective(1000000, 'RANDOM RANDOM 2.0', GlobalConstants.COMPLETED_OBJECTIVE, 8);

        const checkIfObjective0CompletedSpy = Sinon.stub(service as any, 'checkIfObjective0Completed');
        const checkIfObjective1CompletedSpy = Sinon.stub(service as any, 'checkIfObjective1Completed');
        const checkIfObjective2CompletedSpy = Sinon.stub(service as any, 'checkIfObjective2Completed');
        const checkIfObjective3CompletedSpy = Sinon.stub(service as any, 'checkIfObjective3Completed');
        const checkIfObjective4CompletedSpy = Sinon.stub(service as any, 'checkIfObjective4Completed');
        const checkIfObjective5CompletedSpy = Sinon.stub(service as any, 'checkIfObjective5Completed');
        const checkIfObjective6CompletedSpy = Sinon.stub(service as any, 'checkIfObjective6Completed');
        const checkIfObjective7CompletedSpy = Sinon.stub(service as any, 'checkIfObjective7Completed');

        service.isPlayerObjectivesCompleted(gameStubDefined, playerStubDefined, '!placer h8h blabla');
        Sinon.assert.called(checkIfObjective0CompletedSpy);
        Sinon.assert.called(checkIfObjective1CompletedSpy);
        Sinon.assert.called(checkIfObjective2CompletedSpy);
        Sinon.assert.called(checkIfObjective3CompletedSpy);
        Sinon.assert.called(checkIfObjective4CompletedSpy);
        Sinon.assert.called(checkIfObjective5CompletedSpy);
        Sinon.assert.called(checkIfObjective6CompletedSpy);
        Sinon.assert.called(checkIfObjective7CompletedSpy);

        checkIfObjective0CompletedSpy.restore();
        checkIfObjective1CompletedSpy.restore();
        checkIfObjective2CompletedSpy.restore();
        checkIfObjective3CompletedSpy.restore();
        checkIfObjective4CompletedSpy.restore();
        checkIfObjective5CompletedSpy.restore();
        checkIfObjective6CompletedSpy.restore();
        checkIfObjective7CompletedSpy.restore();
    });
});
