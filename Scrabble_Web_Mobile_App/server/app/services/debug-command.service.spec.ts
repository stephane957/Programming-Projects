/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import { Move } from '@app/classes/move';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Trie } from '@app/classes/trie';
import * as chai from 'chai';
import * as sinon from 'sinon';
import { DebugCommandService } from './debug-command.service';


const expect = chai.expect;

describe('Service: DebugCommand', () => {
    let service: DebugCommandService;
    let gameServerStub: sinon.SinonStubbedInstance<GameServer>;

    let player: Player;
    let mockBoard: Tile[][] = [];
    let mockMove: Move;


    const tileStub = {
        letter: {
            value: 't',
            weight: 10,
        },
        old: false
    } as Tile;

    const emptyTileStub = {
        letter: {
            value: '',
            weight: 0,
        },
        old: false
    } as Tile;

    const crossWords = [
        {
            words: [tileStub, tileStub, emptyTileStub, tileStub, emptyTileStub],
            score: 5
        },
        {
            words: [tileStub, tileStub, emptyTileStub, tileStub, emptyTileStub],
            score: 5
        },
        {
            words: [tileStub, tileStub, emptyTileStub, tileStub, emptyTileStub],
            score: 5
        }
    ]

    beforeEach(async () => {
        gameServerStub = sinon.createStubInstance(GameServer);

        player = new Player('testPlayer');
        mockMove = new Move(5, '', [''], '', []);
        mockMove.crossWords = crossWords;

        service = new DebugCommandService();

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

        player.stand = [];

    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('setDebugOutputs should return non empty array (horizontal)', () => {
        mockMove.command = 'b2h';
        mockMove.word = 'word';
        const debugOutputs = service.setDebugOutputs(mockMove, gameServerStub);
        expect(debugOutputs.length).to.be.greaterThan(0);
    });

    it('setDebugOutputs should return non empty array (vertical)', () => {
        mockMove.command = 'b2v';
        mockMove.word = 'word';
        const debugOutputs = service.setDebugOutputs(mockMove, gameServerStub);
        expect(debugOutputs.length).to.be.greaterThan(0);
    });

    it('debugPrint should return null when debug off', () => {
        player.debugOn = false;
        const returnValue = service.debugPrint(player, mockMove, gameServerStub);
        expect(returnValue).to.be.null;
    });

    it('debugPrint should call setDebugOutput', () => {
        mockMove.command = 'b2h';
        mockMove.word = 'word';
        player.idOpponent = 'idOpponent';
        player.debugOn = true;
        gameServerStub.mapPlayers = new Map<string, Player>();

        gameServerStub.mapPlayers.set(player.idOpponent, new Player('opponent'));
        const spy = sinon.spy(service, 'setDebugOutputs');

        service.debugPrint(player, mockMove, gameServerStub);
        sinon.assert.called(spy);
    });
});
