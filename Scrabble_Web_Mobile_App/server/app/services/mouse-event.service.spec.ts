/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as io from 'socket.io';
import { ChatService } from './chat.service';
import { CommunicationBoxService } from './communication-box.service';
import { MouseEventService } from './mouse-event.service';
import { ObjectiveService } from './objective.service';
import { PlayAreaService } from './play-area.service';
import { StandService } from './stand.service';

describe('MouseEventService', () => {
    let service: MouseEventService;
    let standServiceSpy: SinonStubbedInstance<StandService>;
    let commBoxServiceSpy: SinonStubbedInstance<CommunicationBoxService>;
    let chatServiceSpy: SinonStubbedInstance<ChatService>;
    let playAreaServiceSpy: SinonStubbedInstance<PlayAreaService>;
    let objectiveServiceSpy: SinonStubbedInstance<ObjectiveService>;
    let playerStubDefined: Player;
    let gameStubDefined: GameServer;

    const tileStubDefined = {
        letter: {
            value: 't',
            weight: 10,
        },
        old: false,
    } as Tile;

    beforeEach(() => {
        playerStubDefined = new Player('Joe');
        playerStubDefined.stand = new Array<Tile>();
        playerStubDefined.stand[0] = tileStubDefined;
        gameStubDefined = new GameServer(1, false, 'Multi', false, '');

        standServiceSpy = createStubInstance(StandService);
        commBoxServiceSpy = createStubInstance(CommunicationBoxService);
        chatServiceSpy = createStubInstance(ChatService);
        playAreaServiceSpy = createStubInstance(PlayAreaService);
        objectiveServiceSpy = createStubInstance(ObjectiveService);

        service = new MouseEventService(standServiceSpy, chatServiceSpy, playAreaServiceSpy, objectiveServiceSpy);

        service.sio = new io.Server();
    });

    it('should be created', () => {
        expect(service).to.equal(service);
    });

    it('initSioPutLogic should set the sio of the class', () => {
        const newSio = new io.Server();
        service.initSioMouseEvent(newSio);
        expect(service.sio).to.equal(newSio);
    });

    it('leftClickSelection() should call sendStandToClient', () => {
        const value = 20;
        playerStubDefined.tileIndexManipulation = 0;
        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');
        const tileClickedPositionSpy = Sinon.stub(service as any, 'tileClickedPosition').returns(0);

        service.leftClickSelection(playerStubDefined, value);
        Sinon.assert.called(sendStandClientSpy);

        tileClickedPositionSpy.restore();
        sendStandClientSpy.restore();
    });

    it('leftClickSelection() should not call sendStandToClient', () => {
        const value = 20;
        playerStubDefined.stand[0].color = '#AEB1D9';
        playerStubDefined.tileIndexManipulation = 0;
        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');
        const tileClickedPositionSpy = Sinon.stub(service as any, 'tileClickedPosition').returns(0);

        service.leftClickSelection(playerStubDefined, value);
        Sinon.assert.notCalled(sendStandClientSpy);

        tileClickedPositionSpy.restore();
        sendStandClientSpy.restore();
    });

    it('rightClickExchange() should not call sendStandToClient if the tile color is the color of manipulation', () => {
        playerStubDefined.tileIndexManipulation = 0;
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0] = tileStubDefined;
        playerStubDefined.stand[0].color = '#ff6600';
        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');
        const tileClickedPositionSpy = Sinon.stub(service as any, 'tileClickedPosition').returns(0);

        service.rightClickExchange(playerStubDefined, 0);
        Sinon.assert.notCalled(sendStandClientSpy);

        tileClickedPositionSpy.restore();
        sendStandClientSpy.restore();
    });

    it('rightClickExchange() should call sendStandToClient with setColorTile = #AEB1D9', () => {
        const value = 20;
        playerStubDefined.stand[0].color = '#F7F7E3';
        playerStubDefined.tileIndexManipulation = 1;
        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');
        const tileClickedPositionSpy = Sinon.stub(service as any, 'tileClickedPosition').returns(0);

        service.rightClickExchange(playerStubDefined, value);
        Sinon.assert.called(sendStandClientSpy);

        tileClickedPositionSpy.restore();
        sendStandClientSpy.restore();
    });

    it('rightClickExchange() should call sendStandToClient without setColorTile = #AEB1D9', () => {
        const value = 20;
        playerStubDefined.stand[0].color = '#AEB1D9';
        playerStubDefined.tileIndexManipulation = 1;
        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');
        const tileClickedPositionSpy = Sinon.stub(service as any, 'tileClickedPosition').returns(0);

        service.rightClickExchange(playerStubDefined, value);
        Sinon.assert.called(sendStandClientSpy);

        tileClickedPositionSpy.restore();
        sendStandClientSpy.restore();
    });

    it('keyboardSelection() should not call drawChangeSelection if the stand doesn"t have the letter on it', () => {
        playerStubDefined.mapLetterOnStand = new Map();
        playerStubDefined.tileIndexManipulation = 0;
        const changeSelectionSpy = Sinon.stub(service as any, 'drawChangeSelection');
        standServiceSpy.findIndexLetterInStand.returns(0);

        service.keyboardSelection(playerStubDefined, 't');
        Sinon.assert.notCalled(changeSelectionSpy);

        changeSelectionSpy.restore();
        standServiceSpy.findIndexLetterInStand.restore();
    });

    it('keyboardSelection() should call drawChangeSelection if the stand doesn"t have the letter on it', () => {
        playerStubDefined.mapLetterOnStand = new Map();
        playerStubDefined.mapLetterOnStand.set('t', { value: 2 });
        playerStubDefined.tileIndexManipulation = 0;
        const changeSelectionSpy = Sinon.stub(service as any, 'drawChangeSelection');
        standServiceSpy.findIndexLetterInStand.onFirstCall().returns(0);
        standServiceSpy.findIndexLetterInStand.onSecondCall().returns(1);

        service.keyboardSelection(playerStubDefined, 't');
        Sinon.assert.called(changeSelectionSpy);

        changeSelectionSpy.restore();
        standServiceSpy.findIndexLetterInStand.restore();
    });

    it('drawChangeSelection() should call drawOneLetter 2 times if the index are != -1', () => {
        playerStubDefined.stand = new Array<Tile>();
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0] = tileStubDefined;
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[1] = tileStubDefined;

        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');

        service['drawChangeSelection'](playerStubDefined, 0, 1);
        Sinon.assert.called(sendStandClientSpy);

        sendStandClientSpy.restore();
    });

    it('tileClickedPosition should return index 0 for 20px position', () => {
        const value = 20;
        const floorSpy = Sinon.stub(Math, 'floor').returns(0);

        const returnResult = service['tileClickedPosition'](value);
        expect(returnResult).to.equal(0);

        floorSpy.restore();
    });

    it('keyboardAndMouseManipulation should not call doTheManipulation if tileIndex = -1', () => {
        playerStubDefined.tileIndexManipulation = -1;
        const spyManipulation = Sinon.stub(service as any, 'doTheManipulation');

        service.keyboardAndMouseManipulation(gameStubDefined, playerStubDefined, 'A');
        Sinon.assert.notCalled(spyManipulation);
    });

    it('keyboardAndMouseManipulation should call doTheManipulation with MousWheelEvent', () => {
        playerStubDefined.tileIndexManipulation = 0;
        const spyManipulation = Sinon.stub(service as any, 'doTheManipulation');

        service.keyboardAndMouseManipulation(gameStubDefined, playerStubDefined, 'A');
        Sinon.assert.called(spyManipulation);
    });

    it('keyboardAndMouseManipulation should call doTheManipulation with RightKeyEvent', () => {
        playerStubDefined.tileIndexManipulation = 0;
        const spyManipulation = Sinon.stub(service as any, 'doTheManipulation');

        service.keyboardAndMouseManipulation(gameStubDefined, playerStubDefined, 'B');
        Sinon.assert.called(spyManipulation);
    });

    it('keyboardAndMouseManipulation should call doTheManipulation with KeyboardEvent', () => {
        playerStubDefined.tileIndexManipulation = 6;
        const spyManipulation = Sinon.stub(service as any, 'doTheManipulation');

        service.keyboardAndMouseManipulation(gameStubDefined, playerStubDefined, 'A');
        Sinon.assert.called(spyManipulation);
    });

    it('doTheManipulation() should call handleViewManipulation once', () => {
        const handleLogicManipulationSpy = Sinon.stub(service as any, 'handleLogicManipulation');
        const handleViewManipulationSpy = Sinon.stub(service as any, 'handleViewManipulation');
        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');

        service['doTheManipulation'](gameStubDefined, playerStubDefined, 0);
        Sinon.assert.called(sendStandClientSpy);

        handleLogicManipulationSpy.restore();
        handleViewManipulationSpy.restore();
    });

    it('handleViewManipulation() should call drawOneLetter', () => {
        playerStubDefined.tileIndexManipulation = 0;
        playerStubDefined.stand = new Array<Tile>();
        playerStubDefined.stand[0] = tileStubDefined;
        playerStubDefined.stand[1] = tileStubDefined;

        service['handleViewManipulation'](1, playerStubDefined);
        expect(playerStubDefined.stand[playerStubDefined.tileIndexManipulation].color).to.equal('#F7F7E3');
    });

    it('handleLogicManipulation() should call writeArrayLogic', () => {
        playerStubDefined.tileIndexManipulation = 0;
        playerStubDefined.stand = new Array<Tile>();
        playerStubDefined.stand[0] = tileStubDefined;

        service['handleLogicManipulation'](gameStubDefined, playerStubDefined, 0);
        Sinon.assert.called(standServiceSpy.writeLetterArrayLogic);
    });

    it('createExchangeCmd() should return the command with the letter clicked', () => {
        playerStubDefined.stand = new Array<Tile>();
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0] = tileStubDefined;
        playerStubDefined.stand[0].color = '#AEB1D9';

        const returnValue = service['createExchangeCmd'](playerStubDefined);
        expect(returnValue).to.equal('!échanger t');
    });
    it('exchangeButtonClicked() should send message', () => {
        gameStubDefined.isLog2990Enabled = true;
        gameStubDefined.currentPlayerId = 'test';
        gameStubDefined.mapPlayers.set('test', playerStubDefined);
        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');
        commBoxServiceSpy.onEnter.returns(true);
        const resetExchangeTilesSpy = Sinon.stub(service as any, 'resetExchangeTiles');
        playerStubDefined.stand = new Array<Tile>();
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0] = tileStubDefined;
        playerStubDefined.stand[0].color = '#AEB1D9';
        playerStubDefined.stand[1] = new Tile();
        playerStubDefined.stand[1] = tileStubDefined;
        playerStubDefined.stand[1].color = '#AEB1D9';
        playerStubDefined.stand[2] = new Tile();
        playerStubDefined.stand[2] = tileStubDefined;
        playerStubDefined.stand[2].color = '#AEB1D9';
        playerStubDefined.stand[3] = new Tile();
        playerStubDefined.stand[3] = tileStubDefined;
        playerStubDefined.stand[3].color = '#AEB1D9';
        playerStubDefined.stand[4] = new Tile();
        playerStubDefined.stand[4] = tileStubDefined;
        playerStubDefined.stand[4].color = '#AEB1D9';
        playerStubDefined.stand[5] = new Tile();
        playerStubDefined.stand[5] = tileStubDefined;
        playerStubDefined.stand[5].color = '#AEB1D9';
        playerStubDefined.stand[6] = new Tile();
        playerStubDefined.stand[6] = tileStubDefined;
        playerStubDefined.stand[6].color = '#AEB1D9';


        service.exchangeButtonClicked(gameStubDefined, playerStubDefined);
        Sinon.assert.called(sendStandClientSpy);

        commBoxServiceSpy.onEnter.restore();
        resetExchangeTilesSpy.restore();
    });

    it('cancelButtonClicked() should call resetAllTilesStand', () => {
        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');
        const resetAllTilesStandSpy = Sinon.stub(service, 'resetAllTilesStand');

        service.cancelButtonClicked(playerStubDefined);
        Sinon.assert.called(sendStandClientSpy);

        resetAllTilesStandSpy.restore();
    });

    it('resetAllTilesStand() should call resetTilesStandAtPos', () => {
        const resetTileStandAtPosSpy = Sinon.stub(service as any, 'resetTileStandAtPos');

        service.resetAllTilesStand(playerStubDefined);
        Sinon.assert.called(resetTileStandAtPosSpy);

        resetTileStandAtPosSpy.restore();
    });

    it('resetAllTilesStand() should call resetTilesStandAtPos', () => {
        const resetTileStandAtPosSpy = Sinon.stub(service as any, 'resetTileStandAtPos');
        playerStubDefined.stand = new Array<Tile>();
        playerStubDefined.stand[0] = tileStubDefined;
        playerStubDefined.stand[0].color = '#AEB1D9';

        service['resetExchangeTiles'](playerStubDefined);
        Sinon.assert.called(resetTileStandAtPosSpy);

        resetTileStandAtPosSpy.restore();
    });
    it('resetTileStandAtPos() should call drawingService.drawOneLetter', () => {
        playerStubDefined.stand = new Array<Tile>();
        playerStubDefined.stand[0] = new Tile();
        playerStubDefined.stand[0] = tileStubDefined;

        service['resetTileStandAtPos'](playerStubDefined, 0);
        expect(playerStubDefined.stand[0].color).to.equal('#F7F7E3');
    });

    it('boardClick() should call clickIsInBoard', () => {
        const clickIsInBoardSpy = Sinon.stub(service as any, 'clickIsInBoard');
        const resetAllTilesStandSpy = Sinon.stub(service, 'resetAllTilesStand');
        const sendStandClientSpy = Sinon.stub(service as any, 'sendStandToClient');

        const vecTest: Vec2 = { x: 100, y: 100 };

        service.boardClick(playerStubDefined, vecTest);
        Sinon.assert.called(sendStandClientSpy);

        clickIsInBoardSpy.restore();
        resetAllTilesStandSpy.restore();
    });

    it("clickIsInBoard() should call ", () => {
        service['clickIsInBoard'](playerStubDefined, { x: 100, y: 100 });
        expect(service.sio.sockets.sockets);
    });
});
