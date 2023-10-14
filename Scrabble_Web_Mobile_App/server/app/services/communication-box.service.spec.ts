/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import { PlayAreaService } from '@app/services/play-area.service';
import { PutLogicService } from '@app/services/put-logic.service';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ChatService } from './chat.service';
import { CommunicationBoxService } from './communication-box.service';
import { ObjectiveService } from './objective.service';

describe('CommunicationBoxService', () => {
    let service: CommunicationBoxService;
    let chatServiceSpy: SinonStubbedInstance<ChatService>;
    let putLogicSpy: SinonStubbedInstance<PutLogicService>;
    let playAreaSpy: SinonStubbedInstance<PlayAreaService>;
    let objectiveServiceSpy: SinonStubbedInstance<ObjectiveService>;

    let gameStubDefined: GameServer;
    let playerStubDefined: Player;
    beforeEach(async () => {
        playerStubDefined = new Player('Joe');
        gameStubDefined = new GameServer(1, false, 'Multi', false, '');
        playerStubDefined.idPlayer = 'idJoe';
        playerStubDefined.debugOn = true;

        gameStubDefined = new GameServer(1, false, 'Multi', true, '');
        gameStubDefined.currentPlayerId = 'idJoe';
        gameStubDefined.mapPlayers.set('idJoe', playerStubDefined);

        chatServiceSpy = createStubInstance(ChatService, {});
        putLogicSpy = createStubInstance(PutLogicService, {});
        playAreaSpy = createStubInstance(PlayAreaService, {});
        objectiveServiceSpy = createStubInstance(ObjectiveService, {});

        service = new CommunicationBoxService(chatServiceSpy, putLogicSpy, playAreaSpy, objectiveServiceSpy);
    });

    // test if the service is created
    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('onEnter should call chatService.sendMessage for message random', () => {
        service.onEnter(gameStubDefined, playerStubDefined, 'blablabla');
        Sinon.assert.called(chatServiceSpy.sendMessage);
    });

    it("onEnter should call playArea.changePlayer for command '!reserve' if sendMessage is true and debugOn is true", () => {
        chatServiceSpy.sendMessage.returns(true);

        service.onEnter(gameStubDefined, playerStubDefined, '!reserve');
        Sinon.assert.called(chatServiceSpy.printReserveStatus);

        chatServiceSpy.sendMessage.restore();
    });

    it("onEnter should call playArea.changePlayer for command '!passer' if sendMessage is true", () => {
        chatServiceSpy.sendMessage.returns(true);

        service.onEnter(gameStubDefined, playerStubDefined, '!passer');
        Sinon.assert.called(playAreaSpy.changePlayer);

        chatServiceSpy.sendMessage.restore();
    });

    it("onEnter should call playArea.changePlayer for command '!échanger' if computeWordToExchange is true", () => {
        chatServiceSpy.sendMessage.returns(true);
        putLogicSpy.computeWordToExchange.returns();

        service.onEnter(gameStubDefined, playerStubDefined, '!échanger t');
        Sinon.assert.called(playAreaSpy.changePlayer);

        putLogicSpy.computeWordToDraw.restore();
        chatServiceSpy.sendMessage.restore();
    });

    it("onEnter should call playArea.changePlayer for command '!placer' if computeWordToDraw is true", () => {
        chatServiceSpy.sendMessage.returns(true);
        putLogicSpy.computeWordToDraw.returns(true);

        service.onEnter(gameStubDefined, playerStubDefined, '!placer h8h bonjour');
        Sinon.assert.called(playAreaSpy.changePlayer);

        putLogicSpy.computeWordToDraw.restore();
        chatServiceSpy.sendMessage.restore();
    });

    it("onEnter should return false for command '!placer' if computeWordToDraw is false", () => {
        chatServiceSpy.sendMessage.returns(true);
        putLogicSpy.computeWordToDraw.returns(false);

        playerStubDefined.idOpponent = 'Michel';
        gameStubDefined.mapPlayers.set('Michel', playerStubDefined);

        const result = service.onEnter(gameStubDefined, playerStubDefined, '!placer h8h bonjour');
        expect(result).to.equal(false);

        putLogicSpy.computeWordToDraw.restore();
        chatServiceSpy.sendMessage.restore();
    });

    it("onEnter should return false for command '!placer' if computeWordToDraw is false not same just ahead", () => {
        chatServiceSpy.sendMessage.returns(true);
        putLogicSpy.computeWordToDraw.returns(false);

        const result = service.onEnter(gameStubDefined, playerStubDefined, '!placer h8h bonjour');
        expect(result).to.equal(false);

        putLogicSpy.computeWordToDraw.restore();
        chatServiceSpy.sendMessage.restore();
    });
});
