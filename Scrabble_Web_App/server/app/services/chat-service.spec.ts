/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { ChatService } from './chat.service';
import { EndGameService } from './end-game.service';
import { ObjectiveService } from './objective.service';
import { ValidationService } from './validation.service';

describe('ChatService', () => {
    let chatService: ChatService;
    let validationServiceStub: sinon.SinonStubbedInstance<ValidationService>;
    let endGameServiceStub: sinon.SinonStubbedInstance<EndGameService>;
    let gameServerStub: sinon.SinonStubbedInstance<GameServer>;
    let objectiveServiceSpy: sinon.SinonStubbedInstance<ObjectiveService>;

    let playerStub: Player;
    const mockCommands = ['!placer h8h joe', '!échanger joe', '!passer', '!aide', '!debug', '!reserve'];
    const falseCommands = ['!placer z19h k=7', '!échanger 7lè', '!passerr', '!aid', '!débug', '!réserve'];

    beforeEach(() => {
        validationServiceStub = sinon.createStubInstance(ValidationService);
        playerStub = new Player('stephane');
        playerStub.idOpponent = 'joe';
        gameServerStub = sinon.createStubInstance(GameServer);
        gameServerStub.mapPlayers = new Map();
        gameServerStub.letterBank = new Map();
        gameServerStub.mapPlayers.set('joe', playerStub);
        endGameServiceStub = sinon.createStubInstance(EndGameService);
        objectiveServiceSpy = sinon.createStubInstance(ObjectiveService);

        chatService = new ChatService(validationServiceStub, endGameServiceStub, objectiveServiceSpy);
    });

    it('should be created', (done) => {
        expect(chatService).to.equal(chatService);
        done();
    });

    it('sendMessage() should send the message without fail', (done) => {
        expect(chatService.sendMessage('valid message', gameServerStub, playerStub)).to.be.equal(true);
        done();
    });

    it('sendMessage() should fail to send the message', (done) => {
        expect(chatService.sendMessage('!invalidCommand', gameServerStub, playerStub)).to.be.equal(false);
        done();
    });

    it('sendMessage() should return false if it is not the players turn to play', (done) => {
        expect(chatService.sendMessage(mockCommands[Math.floor(Math.random() * 2)], gameServerStub, playerStub)).to.equal(false);
        done();
        expect(playerStub.chatHistory.length).to.equal(2);
    });

    it('sendMessage() should return false if there is not enough letters to be exchanged when !échanger command is entered', (done: Mocha.Done) => {
        validationServiceStub.isCommandValid.withArgs('!échanger lokj').returns(true);
        validationServiceStub.syntaxIsValid.withArgs('!échanger lokj', gameServerStub, playerStub).returns('pas valide');
        validationServiceStub.isCommandValid.restore();
        validationServiceStub.syntaxIsValid.restore();
        expect(chatService.sendMessage('!échanger lokj', gameServerStub, playerStub)).to.be.equal(false);
        done();
    });

    it('sendMessage() should return false if the game has already ended', (done) => {
        gameServerStub.gameFinished = true;
        assert(!chatService.sendMessage('!passer', gameServerStub, playerStub), 'Error expected to be false');
        done();
    });

    it('command functions should add the right number of system messages in the chat history', (done: Mocha.Done) => {
        const numberThree = 3;
        const numberSeven = 7;
        chatService.placeCommand('!placer args', gameServerStub, playerStub);
        expect(playerStub.chatHistory.length).to.equal(numberThree);
        playerStub.chatHistory.length = 0;
        chatService['helpCommand']('!aide', playerStub);
        expect(playerStub.chatHistory.length).to.equal(numberSeven);
        done();
    });

    it('sendMessage() should call the commandFilter() function if command is correctly entered', (done: Mocha.Done) => {
        const commandFilterSpy = sinon.stub(chatService as any, 'commandFilter').callThrough();
        validationServiceStub.isCommandValid.returns(true);
        validationServiceStub.syntaxIsValid.returns('');
        validationServiceStub.verifyPlacementOnBoard.returns('');

        chatService.sendMessage(mockCommands[5], gameServerStub, playerStub);
        commandFilterSpy.restore();
        sinon.assert.called(commandFilterSpy);
        done();
    });

    it('sendMessage() should call entryIsTooLong() and send the correct error message', (done: Mocha.Done) => {
        const input =
            '‘Erat velit scelerisque in dictum non consectetur a.Vel quam elementum pulvinar etiam non.' +
            '‘Quisque non tellus orci ac auctor augue mauris augue.Felis donec et odio pellentesque diam’' +
            '‘volutpat commodo.Morbi enim nunc faucibus a pellentesque sit amet porttitor eget.Elementum’' +
            '‘sagittis vitae et leo duis ut diam quam.Sit amet nulla facilisi morbi tempus iaculis urna.Cursus’' +
            '‘sit amet dictum sit amet.Enim sed faucibus turpis in eu mi bibendum neque.Erat nam at lectus’' +
            '‘urna duis convallis.Tristique et egestas quis ipsum suspendisse.Enim diam vulputate ut pharetra’' +
            '‘sit amet aliquam id.Tellus cras adipiscing enim eu turpis egestas.Elit at imperdiet dui accumsan’' +
            '‘sit amet nulla facilisi.Arcu vitae elementum curabitur vitae nunc sed velit.';
        validationServiceStub.entryIsTooLong.withArgs(input).returns(true);
        const result = chatService.sendMessage(input, gameServerStub, playerStub);
        validationServiceStub.entryIsTooLong.restore();
        expect(playerStub.chatHistory[0].message).equal(GlobalConstants.INVALID_LENGTH);
        expect(result).equal(false);
        done();
    });

    it('sendMessage() recognize if the syntax of the command is valid or not', (done) => {
        validationServiceStub.syntaxIsValid.returns('');
        validationServiceStub.verifyPlacementOnBoard.returns('');

        const message = chatService.sendMessage(falseCommands[3], gameServerStub, playerStub);
        expect(message).equal(false);
        assert(validationServiceStub.isCommandValid.calledOnce);

        validationServiceStub.syntaxIsValid.restore();
        validationServiceStub.verifyPlacementOnBoard.restore();
        done();
    });

    it('sendMessage() should call all three validationService functions in the right conditions', (done: Mocha.Done) => {
        validationServiceStub.entryIsTooLong.returns(false);
        validationServiceStub.isCommandValid.returns(true);
        validationServiceStub.syntaxIsValid.returns('');

        chatService.sendMessage('notToolong', gameServerStub, playerStub);
        assert(validationServiceStub.entryIsTooLong.calledOnce);
        chatService.sendMessage('!notAcommand', gameServerStub, playerStub);
        assert(validationServiceStub.isCommandValid.calledOnce);
        chatService.sendMessage('!placer', gameServerStub, playerStub);
        assert(validationServiceStub.syntaxIsValid.calledOnce);

        validationServiceStub.entryIsTooLong.restore();
        validationServiceStub.isCommandValid.restore();
        validationServiceStub.syntaxIsValid.restore();

        done();
    });

    it('debugCommand() function should update the boolean debugOn (true or false)', (done) => {
        chatService['debugCommand']('!debug', playerStub, gameServerStub);
        expect(playerStub.debugOn).to.be.equal(true);
        chatService['debugCommand']('!debug', playerStub, gameServerStub);
        expect(playerStub.debugOn).to.be.equal(false);
        done();
    });

    it('exchangeCommand() should display a message with the players info and the command entered ', (done) => {
        chatService['exchangeCommand']('!échanger', gameServerStub, playerStub);
        expect(playerStub.chatHistory[0].message).equal('You : ' + '!échanger');
        done();
    });

    it('placeCommmand() should reset the passInARow attribute for the player when called', (done) => {
        const highNumber = 150;
        playerStub.passInARow = Math.floor(Math.random() * highNumber);
        chatService.placeCommand(mockCommands[0], gameServerStub, playerStub);
        expect(playerStub.passInARow).to.equal(0);
        done();
    });

    it('placeCommand() should call the endGame functions if the stand of the real player and the reserve are empty', (done: Mocha.Done) => {
        const spy = sinon.stub(chatService as any, 'showEndGameStats');

        validationServiceStub.reserveIsEmpty.returns(true);
        validationServiceStub.standEmpty.returns(true);

        chatService.placeCommand('!placer h5h bonjour', gameServerStub, playerStub);

        sinon.assert.calledOnce(spy);
        assert(validationServiceStub.reserveIsEmpty.called);
        assert(validationServiceStub.standEmpty.called);

        validationServiceStub.reserveIsEmpty.restore();
        validationServiceStub.standEmpty.restore();
        spy.restore();
        done();
    });

    it('commandFilter() should call the placeCommand function', (done) => {
        const spy = sinon.spy(chatService, 'placeCommand');
        chatService['commandFilter'](mockCommands[0], gameServerStub, playerStub);
        spy.restore();
        sinon.assert.calledOnce(spy);
        sinon.assert.calledWith(spy, mockCommands[0], gameServerStub, playerStub);
        done();
    });

    it('commandFilter() should call the exchangeCommand function', (done) => {
        const chatServiceSpy = sinon.spy(chatService as any, 'exchangeCommand');
        chatService['commandFilter'](mockCommands[1], gameServerStub, playerStub);
        chatServiceSpy.restore();
        sinon.assert.called(chatServiceSpy);
        sinon.assert.calledWith(chatServiceSpy, mockCommands[1], gameServerStub, playerStub);
        done();
    });

    it('commandFilter() should call the passCommand function', (done) => {
        const spy = sinon.spy(chatService, 'passCommand');
        chatService['commandFilter'](mockCommands[2], gameServerStub, playerStub);
        spy.restore();
        sinon.assert.called(spy);
        sinon.assert.calledWith(spy, mockCommands[2], gameServerStub, playerStub);
        done();
    });

    it('commandFilter() should call the helpCommand function', (done) => {
        const spy = sinon.spy(chatService as any, 'helpCommand');
        chatService['commandFilter'](mockCommands[3], gameServerStub, playerStub);
        spy.restore();
        sinon.assert.called(spy);
        sinon.assert.calledWith(spy, mockCommands[3], playerStub);
        done();
    });

    it('commandFilter() should call the debugCommand function', (done) => {
        const spy = sinon.spy(chatService as any, 'debugCommand');
        chatService['commandFilter'](mockCommands[4], gameServerStub, playerStub);
        spy.restore();
        sinon.assert.called(spy);
        sinon.assert.calledWith(spy, mockCommands[4], playerStub);
        done();
    });

    it('commandFilter() should call the reserveCommand', (done: Mocha.Done) => {
        const chatServiceSpy = sinon.spy(chatService as any, 'reserveCommand');
        chatService['commandFilter'](mockCommands[5], gameServerStub, playerStub);
        chatServiceSpy.restore();
        sinon.assert.called(chatServiceSpy);
        sinon.assert.calledWith(chatServiceSpy, mockCommands[5], playerStub);
        done();
    });

    it('passCommand() should call the endGameService function if the number of !passer commands by both player equals three', (done) => {
        playerStub.passInARow = 3;
        const spy = sinon.spy(chatService as any, 'showEndGameStats');
        chatService.passCommand('!passer', gameServerStub, playerStub);
        sinon.assert.called(spy);
        spy.restore();
        done();
    });

    it('should push a message of the player name and the letters exchanged if it is his turn to play', (done) => {
        chatService['exchangeCommand'](mockCommands[1], gameServerStub, playerStub);
        expect(playerStub.chatHistory[0].sender).to.be.equal('P'); // messagePlayer
        expect(playerStub.chatHistory[0].message).to.be.equal('You : ' + mockCommands[1]);
        done();
    });

    it('reserveCommand() should not display the letters in the reserve if debug is off', (done) => {
        chatService['reserveCommand']('!reserve', playerStub);
        expect(playerStub.chatHistory.length).to.equal(1);
        expect(playerStub.chatHistory[0].message).to.equal(GlobalConstants.DEBUG_NOT_ACTIVATED);
        done();
    });

    it('showEndGameStats() chatHistory.length to 8', (done) => {
        const numberSix = 8;
        chatService['showEndGameStats'](gameServerStub, playerStub, false);
        expect(playerStub.chatHistory.length).to.equal(numberSix);
        done();
    });

    it('showEndGameStats() should chatHistory.length to 0', (done) => {
        const numberZero = 0;
        playerStub.idOpponent = 'test';
        chatService['showEndGameStats'](gameServerStub, playerStub, false);
        expect(playerStub.chatHistory.length).to.equal(numberZero);
        done();
    });

    it('the system should display the PASS_CMD message when a player passes his turn ', (done) => {
        chatService.passCommand('!passer', gameServerStub, playerStub);
        expect(playerStub.chatHistory[2].message).equal(GlobalConstants.PASS_CMD);
        expect(playerStub.chatHistory[2].sender).equal('S');
        done();
    });
    it('verifyPlacement on board should have been called', (done) => {
        validationServiceStub.syntaxIsValid.returns('');
        validationServiceStub.isCommandValid.returns(true);
        expect(chatService.sendMessage('!placer h15h joe', gameServerStub, playerStub)).to.be.equal(false);
        validationServiceStub.syntaxIsValid.restore();
        validationServiceStub.isCommandValid.restore();
        done();
    });
    it('printReserveStatus() should have chatService.chatHistory.length = 0', (done) => {
        chatService.printReserveStatus(gameServerStub, playerStub);
        expect(playerStub.chatHistory.length).to.equal(0);
        done();
    });

    it('sendMessage() should return false if syntax is not valid', (done) => {
        validationServiceStub.isCommandValid.returns(true);
        validationServiceStub.syntaxIsValid.returns('blabla');

        const verification = chatService.sendMessage('!a', gameServerStub, playerStub);
        expect(playerStub.chatHistory.length).equal(1);
        expect(verification).equal(false);

        validationServiceStub.isCommandValid.restore();
        validationServiceStub.syntaxIsValid.restore();
        done();
    });

    it('sendMessage() should return false if graphicsError != ""', (done) => {
        validationServiceStub.isCommandValid.returns(true);
        validationServiceStub.syntaxIsValid.returns('');
        validationServiceStub.verifyPlacementOnBoard.returns('blabla');
        playerStub.idPlayer = 'amir';
        gameServerStub.currentPlayerId = 'amir';

        const verification = chatService.sendMessage('!placer', gameServerStub, playerStub);
        expect(playerStub.chatHistory.length).equal(1);
        expect(verification).equal(false);

        validationServiceStub.isCommandValid.restore();
        validationServiceStub.syntaxIsValid.restore();
        validationServiceStub.verifyPlacementOnBoard.restore();
        done();
    });

    it('should add messages to players if the debugOn is true', (done) => {
        playerStub.debugOn = true;
        chatService['reserveCommand']('!reserve', playerStub);
        expect(playerStub.chatHistory.length).to.equal(2);
        done();
    });

    it('should send a message to both players if the player"s score is bigger than the opponents"', (done) => {
        const spy = sinon.stub(chatService as any, 'sendMessageToBothPlayer');
        endGameServiceStub.chooseWinner.returns(GlobalConstants.PLAYER_WIN)

        const opponent = new Player('adam');
        playerStub.score = 10;
        opponent.score = 5;
        chatService['sendWinnerMessage'](gameServerStub, playerStub, opponent);
        sinon.assert.called(spy);


        endGameServiceStub.chooseWinner.restore();
        done();
    });

    it('should send a message to both players if the player"s score is lower than the opponents"', (done) => {
        const spy = sinon.stub(chatService as any, 'sendMessageToBothPlayer');
        endGameServiceStub.chooseWinner.returns(GlobalConstants.OPPONENT_WIN)

        const opponent = new Player('adam');
        playerStub.score = 5;
        opponent.score = 10;
        chatService['sendWinnerMessage'](gameServerStub, playerStub, opponent);
        sinon.assert.called(spy);

        endGameServiceStub.chooseWinner.restore();
        done();
    });

    it('should send a message to both players if the player"s score is equal to the opponents"', (done) => {
        const spy = sinon.stub(chatService as any, 'sendMessageToBothPlayer');
        endGameServiceStub.chooseWinner.returns(GlobalConstants.NOBODY_WIN)

        const opponent = new Player('adam');
        playerStub.score = 5;
        opponent.score = 5;
        chatService['sendWinnerMessage'](gameServerStub, playerStub, opponent);
        sinon.assert.called(spy);

        endGameServiceStub.chooseWinner.restore();
        done();
    });

    it('should display all the letters in the reserveStatus and their quantity', (done) => {
        gameServerStub.letterBank.set('A', { quantity: 9, weight: 11 });
        gameServerStub.letterBank.set('B', { quantity: 2, weight: 3 });
        gameServerStub.letterBank.set('Z', { quantity: 1, weight: 10 });
        chatService.printReserveStatus(gameServerStub, playerStub);
        expect(playerStub.chatHistory.length).equal(3);
        done();
    });
});
