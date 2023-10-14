/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { LetterData } from '@app/classes/letter-data';
import { Move } from '@app/classes/move';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import { DefaultEventsMap } from 'node_modules/socket.io/dist/typed-events';
import * as sinon from 'sinon';
import { stub } from 'sinon';
import * as io from 'socket.io';
import { ChatService } from './chat.service';
import { ExpertVP } from './expert-virtual-player.service';
import { LetterBankService } from './letter-bank.service';
import { ObjectiveService } from './objective.service';
import { PlayAreaService } from './play-area.service';
import { StandService } from './stand.service';
import { VirtualPlayerService } from './virtual-player.service';
import Sinon = require('sinon');

describe('PlayAreaService', () => {
    let service: PlayAreaService;
    let playerStub: Player;
    let gameServerStub: GameServer;
    let standServiceStub: sinon.SinonStubbedInstance<StandService>;
    let letterBankServiceStub: sinon.SinonStubbedInstance<LetterBankService>;
    let chatServiceStub: sinon.SinonStubbedInstance<ChatService>;
    let virtualPlayerStub: sinon.SinonStubbedInstance<VirtualPlayerService>;
    let expertVPStub: sinon.SinonStubbedInstance<ExpertVP>;
    let objectiveServiceStub: sinon.SinonStubbedInstance<ObjectiveService>;
    let clock: sinon.SinonFakeTimers;
    const mockBoard: Tile[][] = [[]];

    beforeEach(async () => {
        chatServiceStub = sinon.createStubInstance(ChatService);
        letterBankServiceStub = sinon.createStubInstance(LetterBankService);
        standServiceStub = sinon.createStubInstance(StandService);
        virtualPlayerStub = sinon.createStubInstance(VirtualPlayerService);
        expertVPStub = sinon.createStubInstance(ExpertVP);
        objectiveServiceStub = sinon.createStubInstance(ObjectiveService);

        playerStub = new Player('test');
        gameServerStub = new GameServer(1, false, 'Multi', true, '');

        service = new PlayAreaService(standServiceStub, letterBankServiceStub, virtualPlayerStub, chatServiceStub, expertVPStub, objectiveServiceStub);
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should be created', () => {
        expect(service).to.equal(service);
    });

    it("initSioPlayArea() should set the sio", () => {
        const newServer = new io.Server;
        service['initSioPlayArea'](newServer);
        expect(service.sio).to.equal(newServer);
    });


    it('changePlayer() should call sendGameToBothPlayer and return,', (done) => {
        gameServerStub.mapPlayers.set('virtualPlayer', playerStub);
        gameServerStub.currentPlayerId = 'virtualPlayer';
        gameServerStub.letterBank = new Map<string, LetterData>();
        gameServerStub.gameMode = GlobalConstants.MODE_SOLO;
        gameServerStub.gameFinished = true;
        playerStub.idOpponent = 'virtualPlayer';
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();
        const sendGameToBothPlayerStub = sinon.stub(service as any, "sendGameToBothPlayer");

        service.changePlayer(gameServerStub);
        sinon.assert.calledOnce(sendGameToBothPlayerStub);
        done();
    });

    it('changePlayer() should call updateOldTiles and triggerTimer,', (done) => {
        gameServerStub.mapPlayers.set('virtualPlayer', playerStub);
        gameServerStub.currentPlayerId = 'virtualPlayer';
        gameServerStub.letterBank = new Map<string, LetterData>();
        gameServerStub.gameMode = GlobalConstants.MODE_SOLO;
        playerStub.idOpponent = 'idoppntplayr';
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        const triggerTimerStub = sinon.stub(service as any, 'triggerTimer').callsFake(() => {
            return;
        });
        const updateSpy = sinon.stub(service as any, 'updateOldTiles').callsFake(() => {
            return;
        });
        service.changePlayer(gameServerStub);
        sinon.assert.calledOnce(triggerTimerStub);
        sinon.assert.calledOnce(updateSpy);
        done();
    });

    it('changePlayer() should call virtualPlayerAction', (done) => {
        gameServerStub.mapPlayers.set('virtualPlayer', playerStub);
        gameServerStub.currentPlayerId = 'solo';
        gameServerStub.letterBank = new Map<string, LetterData>();
        gameServerStub.gameMode = 'Multi';
        playerStub.idOpponent = 'idoppntplayr';
        playerStub.idPlayer = 'virtualPlayer';
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        sinon.stub(service as any, 'triggerTimer').callsFake(() => {
            return;
        });
        sinon.stub(service as any, 'updateOldTiles').callsFake(() => {
            return;
        });
        letterBankServiceStub.getNbLettersInLetterBank.returns(3);
        const virtualAction = sinon.stub(service as any, 'virtualPlayerAction').callsFake(() => {
            return;
        });
        service.changePlayer(gameServerStub);

        sinon.assert.calledOnce(virtualAction);

        letterBankServiceStub.getNbLettersInLetterBank.restore();
        done();
    });

    it('changePlayer() should update client twice', (done) => {
        gameServerStub.mapPlayers.set('virtualPlayer', playerStub);
        gameServerStub.currentPlayerId = 'solo';
        gameServerStub.letterBank = new Map<string, LetterData>();
        gameServerStub.gameMode = 'lpk';
        playerStub.idOpponent = 'idoppntplayr';
        playerStub.idPlayer = 'virtualPlayer';
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        sinon.stub(service as any, 'triggerTimer').callsFake(() => {
            return;
        });
        sinon.stub(service as any, 'updateOldTiles').callsFake(() => {
            return;
        });
        letterBankServiceStub.getNbLettersInLetterBank.returns(3);
        const virtualAction = sinon.stub(service as any, 'virtualPlayerAction').callsFake(() => {
            return;
        });
        service.changePlayer(gameServerStub);

        sinon.assert.calledOnce(virtualAction);

        letterBankServiceStub.getNbLettersInLetterBank.restore();
        done();
    });


    it('playGame() should call triggerTimer', (done) => {
        playerStub.idOpponent = 'idoppntplayr';
        gameServerStub.mapPlayers.set('soloplayer', playerStub);
        gameServerStub.mapPlayers.set('virtualPlayer', playerStub);
        gameServerStub.currentPlayerId = 'virtualPlayer';
        gameServerStub.letterBank = new Map<string, LetterData>();
        gameServerStub.gameMode = 'Multi';

        sinon.stub(service as any, "updateOldTiles");

        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        const triggerStub = sinon.stub(service as any, 'triggerTimer').callsFake(() => {
            return;
        });
        service.playGame(gameServerStub);
        sinon.assert.called(triggerStub);
        sinon.assert.called(letterBankServiceStub.getNbLettersInLetterBank);

        done();
    });

    it('should call randomActionVP(), changePlayer() and wait 4 seconds', (done) => {
        const magicNumber = 4000;
        // fonctionne sans interval
        clock.tick(magicNumber);
        const generateMovesStub = sinon.stub(service as any, 'randomActionVP').callsFake(() => {
            return;
        });
        const changePlayerStub = sinon.stub(service, 'changePlayer').callsFake(() => {
            return;
        });
        service['virtualPlayerAction'](gameServerStub, playerStub);
        clock.tick(magicNumber);
        sinon.assert.calledOnce(generateMovesStub);
        sinon.assert.calledOnce(changePlayerStub);
        done();
    });

    it('should call randomActionExpertVP(), changePlayer() and wait 4 seconds', (done) => {
        const magicNumber = 4000;
        gameServerStub.vpLevel = 'expert';
        // fonctionne sans interval
        clock.tick(magicNumber);
        const generateMovesStub = sinon.stub(service as any, 'randomActionExpertVP').callsFake(() => {
            return;
        });
        const changePlayerStub = sinon.stub(service, 'changePlayer').callsFake(() => {
            return;
        });
        service['virtualPlayerAction'](gameServerStub, playerStub);
        clock.tick(magicNumber);
        sinon.assert.calledOnce(generateMovesStub);
        sinon.assert.calledOnce(changePlayerStub);
        done();
    });

    it('playGame() with player.idPlayer being equal to virtualPlayer', (done) => {
        sinon.stub(service as any, "updateOldTiles");
        letterBankServiceStub.getNbLettersInLetterBank.returns(3);

        playerStub.idOpponent = 'virtualPlayer';
        playerStub.idPlayer = 'virtualPlayer';
        gameServerStub.mapPlayers.set('virtualPlayer', playerStub);
        gameServerStub.currentPlayerId = 'virtualPlayer';
        gameServerStub.letterBank = new Map<string, LetterData>();
        gameServerStub.gameMode = GlobalConstants.MODE_SOLO;
        service.sio = new io.Server();

        const triggerStub = sinon.stub(service as any, 'triggerTimer').callsFake(() => {
            return;
        });

        service.playGame(gameServerStub);
        sinon.assert.called(triggerStub);

        letterBankServiceStub.getNbLettersInLetterBank.restore();
        done();
    });

    it('playGame() with masterTimer = player.idPlayer', (done) => {
        sinon.stub(service as any, "updateOldTiles");
        playerStub.idOpponent = 'joe';
        playerStub.idPlayer = 'joe';
        gameServerStub.mapPlayers.set('joe', playerStub);
        gameServerStub.currentPlayerId = 'joe';
        gameServerStub.gameMode = GlobalConstants.MODE_SOLO;
        service.sio = new io.Server();

        service.playGame(gameServerStub);
        expect(gameServerStub.masterTimer === 'joe');
        done();
    });

    it('playGame() with player.idPlayer branch (player defined)', (done) => {
        sinon.stub(service as any, "updateOldTiles");
        playerStub.idOpponent = 'virtualPlayer';
        playerStub.idPlayer = 'virtualPlayer';
        gameServerStub.mapPlayers.set('virtualPlayer', playerStub);
        gameServerStub.currentPlayerId = 'virtualPlayer';
        gameServerStub.gameMode = GlobalConstants.MODE_SOLO;
        service.sio = new io.Server();

        service.playGame(gameServerStub);
        expect(playerStub.idPlayer === 'virtualPlayer');
        done();
    });

    it('should call checkNbLetterOnStand and getNbLettersInLetterBank', () => {
        service['updateStandAndReserveView'](gameServerStub, playerStub);
        standServiceStub.checkNbLetterOnStand.returns(2)
        letterBankServiceStub.getNbLettersInLetterBank.returns(0)
        sinon.assert.called(standServiceStub.checkNbLetterOnStand);
        sinon.assert.called(letterBankServiceStub.getNbLettersInLetterBank);

        standServiceStub.checkNbLetterOnStand.restore();
        letterBankServiceStub.getNbLettersInLetterBank.restore();
    });

    it('randomActionVp should call standService.randomExchangeVP if proba < 0.1', () => {
        const playerTest = new Player('joueurtest');
        gameServerStub.mapPlayers.set('idcurrntplyer', playerTest);
        const testValue = 0.05;
        let giveProbaMoveStub = sinon.stub(service as any, 'giveProbaMove').returns(testValue);

        service['randomActionVP'](gameServerStub, playerStub);
        sinon.assert.called(standServiceStub.randomExchangeVP);

        giveProbaMoveStub.restore();
    });

    it('randomActionVp should call standService.randomExchangeVP if proba < 0.9', () => {
        const playerTest = new Player('joueurtest');
        gameServerStub.mapPlayers.set('idcurrntplyer', playerTest);
        virtualPlayerStub.generateMoves.returns(new Move(5, '', [], '', []));
        const testValue = 0.25;
        let giveProbaMoveStub = sinon.stub(service as any, 'giveProbaMove').returns(testValue);
        service['randomActionVP'](gameServerStub, playerStub);
        sinon.assert.called(virtualPlayerStub.generateMoves);

        giveProbaMoveStub.restore();
    });

    it('randomActionVP should call chatService.passCommand if proba > 0.9', () => {
        const testValue = 0.99;
        let giveProbaMoveStub = sinon.stub(service as any, 'giveProbaMove').returns(testValue);

        service['randomActionVP'](gameServerStub, playerStub);
        sinon.assert.called(chatServiceStub.passCommand);

        giveProbaMoveStub.restore();
    });

    it('randomActionVP should call chatService.passCommand if proba < 0.1', () => {
        const testValue = 0.05;
        let giveProbaMoveStub = sinon.stub(service as any, 'giveProbaMove').returns(testValue);
        letterBankServiceStub.getNbLettersInLetterBank.returns(1);

        service['randomActionVP'](gameServerStub, playerStub);
        sinon.assert.called(chatServiceStub.passCommand);

        giveProbaMoveStub.restore();
        letterBankServiceStub.getNbLettersInLetterBank.restore();
    });

    it('giveProbaMove return a number beetween 0 and 1', () => {
        const returnValue = service['giveProbaMove']();
        expect(returnValue).to.be.lessThanOrEqual(1);
    });

    it('should updateOldTiles', () => {
        mockBoard[7] = new Array<Tile>();
        mockBoard[7][8] = new Tile();
        mockBoard[7][8].letter = new Letter();
        mockBoard[7][8].letter.value = 'l';
        mockBoard[7][8].old = false;

        mockBoard[8] = new Array<Tile>();
        mockBoard[8][7] = new Tile();
        mockBoard[8][7].letter = new Letter();
        mockBoard[8][7].letter.value = 'd';
        mockBoard[8][7].old = false;

        mockBoard[9] = new Array<Tile>();
        mockBoard[9][8] = new Tile();
        mockBoard[9][8].letter = new Letter();
        mockBoard[9][8].letter.value = 's';
        mockBoard[9][8].old = false;

        mockBoard[8][9] = new Tile();
        mockBoard[8][9].letter = new Letter();
        mockBoard[8][9].letter.value = 's';
        mockBoard[8][9].old = false;

        mockBoard[8][8] = new Tile();
        mockBoard[8][8].letter = new Letter();
        mockBoard[8][8].letter.value = 'e';
        mockBoard[8][8].old = false;

        gameServerStub.board = mockBoard;
        service['updateOldTiles'](gameServerStub);
        expect(mockBoard[8][8].old).to.equal(true);
        expect(mockBoard[9][8].old).to.equal(true);
        expect(mockBoard[8][7].old).to.equal(true);
        expect(mockBoard[7][8].old).to.equal(true);
        expect(mockBoard[8][9].old).to.equal(true);
    });

    it('triggerTimer() should return if player is undefined', () => {
        gameServerStub.mapPlayers = new Map<string, Player>();
        gameServerStub.currentPlayerId = 'solo';
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        service['triggerTimer'](gameServerStub);
        expect(service.sio.sockets.sockets);
    });

    it('triggerTimer() should clearTimer of both players if gamemode is Multi', () => {
        gameServerStub.mapPlayers = new Map<string, Player>();
        gameServerStub.mapPlayers.set('solo', playerStub);
        gameServerStub.currentPlayerId = 'solo';
        gameServerStub.gameMode = 'Multi';
        gameServerStub.minutesByTurn = 4;
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        service['triggerTimer'](gameServerStub);
        expect(service.sio.sockets.sockets);
    });

    it('triggerTimer() should clearTimer of both players if gamemode is Multi', () => {
        gameServerStub.mapPlayers = new Map<string, Player>();
        gameServerStub.mapPlayers.set('solo', playerStub);
        gameServerStub.currentPlayerId = 'solo';
        gameServerStub.gameMode = 'SomethingElse';
        gameServerStub.minutesByTurn = 4;
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        service['triggerTimer'](gameServerStub);
        expect(service.sio.sockets.sockets);
    });

    it('should clearTimer of both players if the virtual player is playing', () => {
        gameServerStub.mapPlayers = new Map<string, Player>();
        playerStub.idPlayer = 'virtualPlayer';
        playerStub.idOpponent = 'test';
        gameServerStub.mapPlayers.set('virtualPlayer', playerStub);
        gameServerStub.currentPlayerId = 'virtualPlayer';
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();


        service['triggerTimer'](gameServerStub);
        expect(service.sio.sockets.sockets);
    });

    it('triggerTimer() should not emit startClearTimer of both players if the virtual player is playing', () => {
        gameServerStub.mapPlayers = new Map<string, Player>();
        playerStub.idPlayer = 'virtualPlayer';
        gameServerStub.mapPlayers.set('virtualPlayer', playerStub);
        gameServerStub.currentPlayerId = 'virtualPlayer';
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        service['triggerTimer'](gameServerStub);
        expect(service.sio.sockets.sockets);
    });

    it("sendGameToBothPlayer() should call emit once", () => {
        gameServerStub.gameMode = 'Multi';
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        service['sendGameToBothPlayer'](gameServerStub, playerStub, playerStub);
        expect(service.sio.sockets.sockets);
    });

    it("sendGameToBothPlayer() should call emit once", () => {
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();

        playerStub.idPlayer = 'virtualPlayer';
        service['sendGameToBothPlayer'](gameServerStub, playerStub, playerStub);
        expect(service.sio.sockets.sockets);
    });

    it("giveRandomNbOpponent() should return a number between 0 and parameter", () => {
        for (let i = 0; i < 1000; i++) {
            const returnValue = service['giveRandomNbOpponent'](10);
            expect(returnValue).to.be.lessThan(10);
        }
    });

    it("triggerStopTimer() should have sockets defined", () => {
        service.sio = new io.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>();
        playerStub.idOpponent = 'notVirtualPlayer';

        service['triggerStopTimer'](playerStub);
        expect(service.sio.sockets.sockets)
    });

    it('generateNameOpponent should change the player name if the name is taken', () => {
        const giveRandomNbOpponentSpy = stub(service as any, 'giveRandomNbOpponent').returns(2);

        service.generateNameOpponent('Hugh Jass');
        Sinon.assert.called(giveRandomNbOpponentSpy);

        giveRandomNbOpponentSpy.restore();
    });


    it('generateNameOpponent() should change the player name if the name is taken', () => {
        const giveRandomNbOpponentSpy = stub(service as any, 'giveRandomNbOpponent').returns(1);

        service.generateNameOpponent('Lee Hwak');
        Sinon.assert.called(giveRandomNbOpponentSpy);

        giveRandomNbOpponentSpy.restore();
    });

    it("replaceHumanByBot() should push two message in the chatHistory of the opponent", () => {
        gameServerStub.currentPlayerId = playerStub.idPlayer;

        service.replaceHumanByBot(playerStub, playerStub, gameServerStub, "s'est casse la tete");
        expect(playerStub.chatHistory.length).to.equal(2);
    });

    it('randomActionExpertVP should return placement command when move generated', () => {
        const mockMove = new Move(5, 'h2h', [], 'word', []);
        expertVPStub.generateMoves.returns(mockMove);

        const resultCommand = service['randomActionExpertVP'](gameServerStub, playerStub);
        expect(resultCommand.slice(0, 7)).to.equal('!placer');
    });

    it('randomActionExpertVP should return exchange command when no move & non empty letterBank', () => {
        expertVPStub.generateMoves.returns(undefined);

        const resultCommand = service['randomActionExpertVP'](gameServerStub, playerStub);
        expect(resultCommand.slice(0, 9)).to.equal('!échanger');
    });

    it('randomActionExpertVP should return skip command when no move & empty letterBank', () => {
        expertVPStub.generateMoves.returns(undefined);
        gameServerStub.letterBank = new Map<string, LetterData>();

        const resultCommand = service['randomActionExpertVP'](gameServerStub, playerStub);
        expect(resultCommand.slice(0, 7)).to.equal('!passer');
    });

});
