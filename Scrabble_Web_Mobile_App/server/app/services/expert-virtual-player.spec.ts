/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import { Move } from '@app/classes/move';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Trie } from '@app/classes/trie';
import * as chai from 'chai';
import * as sinon from 'sinon';
import { BoardExplorerService } from './board-explorer.service';
import { ChatService } from './chat.service';
import { DebugCommandService } from './debug-command.service';
import { DictionaryService } from './dictionary.service';
import { ExpertVP } from './expert-virtual-player.service';
import { PutLogicService } from './put-logic.service';
import { ScoreCountService } from './score-count.service';

const expect = chai.expect;

describe('ExpertVPService', () => {
    let service: ExpertVP;
    let dictionaryStub: sinon.SinonStubbedInstance<DictionaryService>;
    let chatStub: sinon.SinonStubbedInstance<ChatService>;
    let boardExplorerStub: sinon.SinonStubbedInstance<BoardExplorerService>;
    let scoreCountStub: sinon.SinonStubbedInstance<ScoreCountService>;
    let putLogicStub: sinon.SinonStubbedInstance<PutLogicService>;
    let debugCommandStub: sinon.SinonStubbedInstance<DebugCommandService>;

    let gameServerStub: sinon.SinonStubbedInstance<GameServer>;
    let player: Player;

    let mockBoard: Tile[][] = [];
    // let mockLetterStand: string[] = [];
    const mockTileStand: Tile[] = [];

    const tileStub = {
        letter: {
            value: 't',
            weight: 10,
        },
    } as Tile;

    const emptyTileStub = {
        letter: {
            value: '',
            weight: 0,
        },
    } as Tile;

    beforeEach(async () => {
        dictionaryStub = sinon.createStubInstance(DictionaryService);
        chatStub = sinon.createStubInstance(ChatService);
        boardExplorerStub = sinon.createStubInstance(BoardExplorerService);
        scoreCountStub = sinon.createStubInstance(ScoreCountService);
        putLogicStub = sinon.createStubInstance(PutLogicService);
        debugCommandStub = sinon.createStubInstance(DebugCommandService);

        gameServerStub = sinon.createStubInstance(GameServer);
        player = new Player('testPlayer');

        service = new ExpertVP(dictionaryStub, chatStub, boardExplorerStub, scoreCountStub, putLogicStub, debugCommandStub);

        mockBoard = [
            [emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub],
            [emptyTileStub, tileStub, tileStub, emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub],
            [emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub, tileStub, emptyTileStub],
            [emptyTileStub, emptyTileStub, emptyTileStub, tileStub, tileStub, emptyTileStub, emptyTileStub],
            [emptyTileStub, emptyTileStub, emptyTileStub, tileStub, tileStub, tileStub, emptyTileStub],
            [emptyTileStub, tileStub, emptyTileStub, emptyTileStub, tileStub, tileStub, emptyTileStub],
            [emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub, emptyTileStub],
        ];
        gameServerStub.board = mockBoard;
        gameServerStub.mapLetterOnBoard = new Map();
        gameServerStub.letterBank = new Map();
        gameServerStub.trie = new Trie();
        gameServerStub.trie.add('word');

        player.stand = mockTileStand;
        service.movesExpert = [];
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('assignMove should add a move', () => {
        const number = 5;
        const mockMove = new Move(number, '', [''], '', []);

        service.assignMove(mockMove);
        expect(service.movesExpert.length).to.equal(1);
    });

    it('randomPlacement returns undefined when no moves', () => {
        const output = service.randomPlacement(gameServerStub, player);
        expect(output).to.be.undefined;
    });

    it('randomPlacement should call these methods when there are moves', () => {
        const number = 5;
        const mockMove = new Move(number, '', [''], '', []);
        service.movesExpert = [];
        service.assignMove(mockMove);

        service.randomPlacement(gameServerStub, player);

        sinon.assert.called(putLogicStub.computeWordVPToDraw);
        sinon.assert.called(chatStub.placeCommand);
        sinon.assert.called(debugCommandStub.debugPrint);
    });
});
