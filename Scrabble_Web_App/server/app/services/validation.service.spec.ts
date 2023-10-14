/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { LetterBankService } from './letter-bank.service';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let validator: ValidationService;
    let gameServerStub: sinon.SinonStubbedInstance<GameServer>;
    let player: Player;
    let letterBankStub: sinon.SinonStubbedInstance<LetterBankService>;
    let mockCommands: string[];
    const mockBoard: Tile[][] = [[]];

    beforeEach(async () => {
        mockBoard[7] = new Array<Tile>();
        mockBoard[7][8] = new Tile();
        mockBoard[7][8].letter = new Letter();
        mockBoard[7][8].letter.value = 'l';

        mockBoard[8] = new Array<Tile>();
        mockBoard[8][7] = new Tile();
        mockBoard[8][7].letter = new Letter();
        mockBoard[8][7].letter.value = 'd';

        mockBoard[9] = new Array<Tile>();
        mockBoard[9][8] = new Tile();
        mockBoard[9][8].letter = new Letter();
        mockBoard[9][8].letter.value = 's';

        mockBoard[8][9] = new Tile();
        mockBoard[8][9].letter = new Letter();
        mockBoard[8][9].letter.value = 's';

        mockBoard[8][8] = new Tile();
        mockBoard[8][8].letter = new Letter();
        mockBoard[8][8].letter.value = 'e';

        letterBankStub = sinon.createStubInstance(LetterBankService);
        validator = new ValidationService(letterBankStub);
        gameServerStub = sinon.createStubInstance(GameServer);
        gameServerStub.board = mockBoard;
        gameServerStub.mapLetterOnBoard = new Map();
        player = new Player('test');
        mockCommands = ['!placer h8h joe', '!échanger joe', '!passer', '!aide', '!debug', '!reserve'];
    });

    it('should be created', () => {
        expect(validator).to.equal(validator);
    });

    it('entryIsLong() function should return false if entry.length is under 512 caracters', () => {
        expect(validator.entryIsTooLong('validEntryNotTooLong')).to.equal(false);
    });

    it('isCommandValid() should be able to recognize if command is valid or not', () => {
        expect(validator.isCommandValid('!placer')).to.equal(true);
        expect(validator.isCommandValid('!aide')).to.equal(true);
        expect(validator.isCommandValid('!whatever')).to.equal(false);
    });

    it('syntaxIsValid() switch case should be able to call the correct validation function for each type of command', () => {
        const stubPlace = sinon.stub(validator as any, 'isPlaceInputValid').returns('');
        const stubExchange = sinon.stub(validator as any, 'isExchangeInputValid').returns('');
        validator.syntaxIsValid('!placer g10v bonjour', gameServerStub, player);
        stubPlace.restore();
        sinon.assert.calledOnce(stubPlace);
        validator.syntaxIsValid('!échanger k1o', gameServerStub, player);
        stubExchange.restore();
        sinon.assert.calledOnce(stubExchange);
    });

    it('syntaxIsValid() should return error message if any commands other than !placer or !échanger are entered with arguments', () => {
        expect(validator.syntaxIsValid('!aide 0', gameServerStub, player)).to.equal('Commande Invalide');
        expect(validator.syntaxIsValid('!reserve lof', gameServerStub, player)).to.equals('Commande Invalide');
        expect(validator.syntaxIsValid('!passer 13*', gameServerStub, player)).to.equals('Commande Invalide');
        expect(validator.syntaxIsValid('!debug =', gameServerStub, player)).to.equals('Commande Invalide');
    });

    it('isExchangeInputValid function should return false if there is 6 letters or less in the reserve', () => {
        const randomNumber = Math.floor(Math.random() * (GlobalConstants.NB_MIN_LETTER_BANK - 1));
        letterBankStub.getNbLettersInLetterBank.returns(randomNumber);
        expect(validator['isExchangeInputValid']([mockCommands[1]], gameServerStub.letterBank, player)).to.equal(GlobalConstants.NOT_ENOUGH_LETTERS);
        sinon.assert.called(letterBankStub.getNbLettersInLetterBank);
        letterBankStub.getNbLettersInLetterBank.restore();
    });

    it('syntaxIsValid function should not accept !placer command with invalid positionning', () => {
        const four = 4;
        const spy = sinon.spy(validator as any, 'isPlacePositionValid');
        expect(validator.syntaxIsValid('!placer a16v bonjour', gameServerStub, player)).to.equal(GlobalConstants.INVALID_ARGUMENTS_PLACER); // la colonne n'existe pas
        expect(validator.syntaxIsValid('!placer g0h bonjour', gameServerStub, player)).to.equal(GlobalConstants.INVALID_ARGUMENTS_PLACER);
        expect(validator.syntaxIsValid('!placer z14h bonjour', gameServerStub, player)).to.equal(GlobalConstants.INVALID_ARGUMENTS_PLACER); // la ligne n'existe pas
        expect(validator.syntaxIsValid('!placer f1g bonjour', gameServerStub, player)).to.equal(GlobalConstants.INVALID_ARGUMENTS_PLACER); // l'orientation est fausse
        spy.restore();
        sinon.assert.callCount(spy, four);
    });

    it('syntaxIsValid should not accept commands with invalid word arguments', () => {
        expect(validator.syntaxIsValid('!placer a1h bo/9=+ur', gameServerStub, player)).to.equal(GlobalConstants.INVALID_WORD);
        expect(validator.syntaxIsValid('!placer a1h *****5;', gameServerStub, player)).to.equal(GlobalConstants.INVALID_WORD);
        expect(validator.syntaxIsValid('!échanger /o_j@ur', gameServerStub, player)).to.equal(GlobalConstants.LETTER_NOT_IN_ALPHABET);
    });

    it('belongsInAlphabet function should reject letters that dont belong in the alphabet', () => {
        expect(validator['belongsInAlphabet']('a')).to.equal(true);
        expect(validator['belongsInAlphabet']('5')).to.equal(false);
        expect(validator['belongsInAlphabet']('Q')).to.equal(true);
        expect(validator['belongsInAlphabet']('/')).to.equal(false);
    });

    it('syntaxIsValid() should return an empty string if a valid command other than !placer or !échanger is entered', () => {
        const randomNumber = Math.floor(Math.random() * 3) + 2; // nombre pseudo-aléatoire entre 2 et 5
        const returnValue = validator.syntaxIsValid(mockCommands[randomNumber], gameServerStub, player);
        expect(returnValue).to.equal('');
    });

    it('isExchangeInputValid() should return an error message if  the !échanger command is entered with no letters to exchange', () => {
        expect(validator['isExchangeInputValid'](['!échanger', ''], gameServerStub.letterBank, player)).to.equal(
            GlobalConstants.INVALID_ARGUMENTS_EXCHANGE,
        );
    });

    it('isExchangeInputValid should return the correct error message', () => {
        player.mapLetterOnStand = new Map();
        player.mapLetterOnStand.set('l', { value: 8 });
        player.mapLetterOnStand.set('o', { value: undefined });
        player.mapLetterOnStand.set('d', { value: 2 });
        expect(validator['isExchangeInputValid'](['!échanger', 'lod'], gameServerStub.letterBank, player)).to.equal(GlobalConstants.LETTER_NOT_ON_STAND);
    });

    it('isPlaceInputValid() should return an error message if the word cannot fit into the board', () => {
        gameServerStub.noTileOnBoard = false;
        const spy = sinon.spy(validator as any, 'wordFitsBoard');
        expect(validator.verifyPlacementOnBoard(['!placer', 'g15h', 'jour'], gameServerStub, player)).to.equal(GlobalConstants.WORD_DONT_FIT_BOARD);
        spy.restore();
        sinon.assert.called(spy);
    });

    it('should call lettersHaveContactWithOthers function if it is not the first turn', () => {
        gameServerStub.mapLetterOnBoard.set('g', { value: 2 });
        gameServerStub.noTileOnBoard = false;
        sinon.stub(validator as any, 'wordFitsBoard').returns(true);
        sinon.stub(validator as any, 'lettersAreOnBoardOrStand').returns(true);
        const stub = sinon.stub(validator as any, 'lettersHaveContactWithOthers');
        validator.verifyPlacementOnBoard(['!placer', 'e8h', 'bon'], gameServerStub, player);
        sinon.assert.called(stub);
        stub.restore();
    });

    it('should call areLettersUsedFromCanvasWellPlaced function and return the correct message', (done) => {
        gameServerStub.noTileOnBoard = false;
        sinon.stub(validator as any, 'wordFitsBoard').returns(true);
        sinon.stub(validator as any, 'lettersAreOnBoardOrStand').returns(true);
        sinon.stub(validator as any, 'lettersHaveContactWithOthers').returns(true);
        sinon.stub(validator as any, 'areLettersUsedFromCanvasWellPlaced').returns(false);
        expect(validator.verifyPlacementOnBoard(['!placer', 'e8v', 'beau'], gameServerStub, player)).to.equal(
            GlobalConstants.LETTERS_FROM_BOARD_WRONG,
        );
        validator.verifyPlacementOnBoard(['!placer', 'e8v', 'beau'], gameServerStub, player);
        done();
    });

    it('lettersTouchH8Square should be called and return the correct error message', (done) => {
        gameServerStub.noTileOnBoard = true;
        sinon.stub(validator as any, 'lettersTouchH8Square').returns(false);
        expect(validator.verifyPlacementOnBoard(['!placer', 'e8v', 'beau'], gameServerStub, player)).to.equal(GlobalConstants.FIRST_LETTER_NOT_IN_H8);
        validator.verifyPlacementOnBoard(['!placer', 'e8v', 'beau'], gameServerStub, player);
        done();
    });

    it('should reject letters or caracters not in the alphabet', () => {
        const spy = sinon.spy(validator as any, 'belongsInAlphabet');
        const incorrectWord = 'glk/+dd^d';
        const correctWord = 'dichotomie';
        validator['isPlaceInputValid'](['!placer', 'e8v', incorrectWord], gameServerStub);
        validator['isPlaceInputValid'](['!placer', 'e8v', correctWord], gameServerStub);
        sinon.assert.called(spy);
    });

    it('isPlaceInputValid() should return an empty string if the command !placer is correctly entered', () => {
        expect(validator['isPlaceInputValid'](['!placer', 'h8h', 'joe'], gameServerStub)).to.equal('');
    });

    it('isPlacePositionValid function should return an error message if the position entered is invalid', () => {
        expect(validator['isPlacePositionValid']('z98f')).to.equal(false);
        expect(validator['isPlacePositionValid']('h16-h')).to.equal(false);
        expect(validator['isPlacePositionValid']('f*v')).to.equal(false);
    });

    it('wordFitsBoard function should return an error message if the word does not fit in the board', () => {
        expect(validator['wordFitsBoard']('veritablement', 'o15h')).to.equal(false);
        expect(validator['wordFitsBoard']('generationnel', 'o15v')).to.equal(false);
    });

    it('lettersTouchH8Square funciton should return false if none of the letters of the word touches h8 the square', () => {
        expect(validator['lettersTouchH8Square']('bonjour', 'g5h')).to.equal(false);
        expect(validator['lettersTouchH8Square']('bonjour', 'g5v')).to.equal(false);
    });

    it('reserveIsEmpty should return true if the reserve is really empty, else return false', () => {
        letterBankStub.getNbLettersInLetterBank.returns(0);
        expect(validator.reserveIsEmpty(gameServerStub.letterBank)).to.equal(true);
        letterBankStub.getNbLettersInLetterBank.restore();
    });

    it('reserveIsEmpty should return false if the reserve is not empty', () => {
        letterBankStub.addLettersToBankAndArray('fire', gameServerStub.letters, gameServerStub.letterBank);
        expect(validator.reserveIsEmpty(gameServerStub.letterBank)).to.equal(false);
        letterBankStub.addLettersToBankAndArray.restore();
    });

    it('standRPEmpty should return true if the stand of the real player is empty', () => {
        player.mapLetterOnStand.clear();
        expect(validator.standEmpty(player)).to.equal(true);
    });

    it('standRPEmpty should return false if the stand of the player is not empty', () => {
        const tile = new Tile();
        player.stand.push(tile);
        expect(validator.standEmpty(player)).to.equal(false);
    });

    it('lettersAreOnBoardOrStand function', () => {
        gameServerStub.mapLetterOnBoard.set('r', { value: 7 });
        gameServerStub.mapLetterOnBoard.set('s', { value: 1 });
        player.mapLetterOnStand.set('u', { value: 8 });
        player.mapLetterOnStand.set('e', { value: 5 });
        expect(validator['lettersAreOnBoardOrStand']('rues', gameServerStub, player)).to.be.equal(true);
        expect(validator['lettersAreOnBoardOrStand']('rUes', gameServerStub, player)).to.equal(false);
    });

    it('lettersAreOnBoardOrStand function => case where the letters of the word are both on the stand and the board', () => {
        gameServerStub.mapLetterOnBoard.set('l', { value: 7 });
        gameServerStub.mapLetterOnBoard.set('e', { value: 1 });
        gameServerStub.mapLetterOnBoard.set('s', { value: 1 });
        player.mapLetterOnStand.set('l', { value: 8 });
        player.mapLetterOnStand.set('e', { value: 5 });
        player.mapLetterOnStand.set('s', { value: 5 });
        expect(validator['lettersAreOnBoardOrStand']('les', gameServerStub, player)).to.equal(true);
    });

    it('lettersAreOnBoardOrStand function should return false passing by case 1', () => {
        gameServerStub.mapLetterOnBoard.set('a', { value: 1 });
        gameServerStub.mapLetterOnBoard.set('v', { value: 1 });
        player.mapLetterOnStand.set('a', { value: 1 });
        player.mapLetterOnStand.set('i', { value: 1 });
        player.mapLetterOnStand.set('t', { value: 1 });
        expect(validator['lettersAreOnBoardOrStand']('aviata', gameServerStub, player)).to.equal(false);
    });

    it('lettersAreOnBoardOrStand function should return false passing by case 2', () => {
        gameServerStub.mapLetterOnBoard.set('b', { value: 1 });
        gameServerStub.mapLetterOnBoard.set('a', { value: 1 });
        gameServerStub.mapLetterOnBoard.set('s', { value: 1 });
        player.mapLetterOnStand.set('l', { value: 1 });
        player.mapLetterOnStand.set('e', { value: 1 });
        expect(validator['lettersAreOnBoardOrStand']('leeebs', gameServerStub, player)).to.equal(false);
    });

    it('lettersAreOnBoardOrStand function should return false passing by case 3', () => {
        gameServerStub.mapLetterOnBoard.set('l', { value: 1 });
        gameServerStub.mapLetterOnBoard.set('e', { value: 1 });
        player.mapLetterOnStand.set('b', { value: 1 });
        player.mapLetterOnStand.set('a', { value: 1 });
        player.mapLetterOnStand.set('s', { value: 1 });
        expect(validator['lettersAreOnBoardOrStand']('leeebs', gameServerStub, player)).to.equal(false);
    });

    it('lettersAreOnBoardOrStand function should return false', () => {
        expect(validator['lettersAreOnBoardOrStand']('*toile', gameServerStub, player)).to.equal(false);
    });
    it('isExchangeInputValid should return empty string if the letters to be exchanged are in the players stand', () => {
        sinon.stub(validator as any, 'belongsInAlphabet').returns(true).restore();
        player.mapLetterOnStand.set('g', { value: 1 });
        player.mapLetterOnStand.set('d', { value: 1 });
        player.mapLetterOnStand.set('a', { value: 1 });
        player.mapLetterOnStand.set('k', { value: 1 });
        expect(validator['isExchangeInputValid'](['!échanger', 'gd'], gameServerStub.letterBank, player)).to.equal('');
    });

    it('isExchangeInputValid should return error message', () => {
        sinon.stub(validator as any, 'belongsInAlphabet').returns(true).restore();
        player.mapLetterOnStand.set('g', { value: 6 });
        player.mapLetterOnStand.set('t', { value: 0 });
        expect(validator['isExchangeInputValid'](['!échanger', 'gt'], gameServerStub.letterBank, player)).to.equal(GlobalConstants.LETTER_NOT_ON_STAND);
    });

    it('areLettersUsedFromCanvasWellPlaced function should return false if', () => {
        player.mapLetterOnStand.set('a', { value: 5 });
        gameServerStub.board = mockBoard;
        gameServerStub.mapLetterOnBoard.set('l', { value: 1 });
        gameServerStub.mapLetterOnBoard.set('a', { value: 5 });
        expect(validator['areLettersUsedFromCanvasWellPlaced']('la', 'h8h', gameServerStub, player)).to.equal(false);
    });

    it('areLettersUsedFromCanvasWellPlaced should return true while incrementing the local variable indexColumn', () => {
        player.mapLetterOnStand.set('a', { value: 5 });
        expect(validator['areLettersUsedFromCanvasWellPlaced']('la', 'h8h', gameServerStub, player)).to.equal(true);
    });

    it('areLettersUsedFromCanvasWellPlaced should return true while incrementing the local variable indexColumn', () => {
        player.mapLetterOnStand.set('a', { value: 5 });
        expect(validator['areLettersUsedFromCanvasWellPlaced']('la', 'h8v', gameServerStub, player)).to.equal(true);
    });

    it('change test description', () => {
        gameServerStub.mapLetterOnBoard.set('g', { value: 1 });
        sinon.stub(validator as any, 'wordFitsBoard').returns(true);
        sinon.stub(validator as any, 'lettersAreOnBoardOrStand').returns(true);
        // const spy = spyOn(validator, 'lettersHaveContactWithOthers');
        validator['isPlaceInputValid'](['!placer', 'g10h', 'place'], gameServerStub);
        // expect(spy).toHaveBeenCalled();
        expect(validator['isPlaceInputValid'](['!placer', 'g10h', 'place'], gameServerStub)).to.equal('');
    });

    it('verifyPlacementOnBoard should return error message if the words letters are not on board or stand', () => {
        gameServerStub.mapLetterOnBoard.set('a', { value: 1 });
        gameServerStub.mapLetterOnBoard.set('v', { value: 1 });
        player.mapLetterOnStand.set('a', { value: 1 });
        player.mapLetterOnStand.set('i', { value: 1 });
        player.mapLetterOnStand.set('t', { value: 1 });
        sinon.stub(validator as any, 'wordFitsBoard').callsFake(() => {
            return true;
        });
        expect(validator.verifyPlacementOnBoard(['!placer', 'h8h', 'aviata'], gameServerStub, player)).to.equal(GlobalConstants.LETTERS_NOT_PRESENT);
    });

    it('verifyPlacementOnBoard should return an empty string', () => {
        player.mapLetterOnStand.set('j', { value: 1 });
        player.mapLetterOnStand.set('o', { value: 1 });
        player.mapLetterOnStand.set('e', { value: 1 });
        gameServerStub.noTileOnBoard = true;
        sinon.stub(validator as any, 'lettersHaveContactWithOthers').returns(true).restore(); // 350 lines max (disable?)
        sinon.stub(validator as any, 'areLettersUsedFromCanvasWellPlaced').returns(true).restore();
        expect(validator.verifyPlacementOnBoard(['!placer', 'h8h', 'joe'], gameServerStub, player)).to.equal('');
    });

    it('lettersHaveContactWithOthers function should return true', async () => {
        gameServerStub.board = mockBoard;
        expect(validator['lettersHaveContactWithOthers']('les', 'h8h', gameServerStub)).to.equal(true);
    });

    it('lettersHaveContactWithOthers function should return false', () => {
        gameServerStub.board = mockBoard;
        mockBoard[7][8].letter.value = '';
        mockBoard[9][8].letter.value = '';
        mockBoard[8][7].letter.value = '';
        mockBoard[8][9].letter.value = '';
        mockBoard[8][8].letter.value = '';
        expect(validator['lettersHaveContactWithOthers']('l', 'h8h', gameServerStub)).to.equal(false);
        expect(validator['lettersHaveContactWithOthers']('l', 'h8v', gameServerStub)).to.equal(false);
    });
});
