/* eslint-disable */
import { GameServer } from '@app/classes/game-server';
import { Letter } from '@app/classes/letter';
import { Move } from '@app/classes/move';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Trie } from '@app/classes/trie';
import { Vec2 } from '@app/classes/vec2';
import * as chai from 'chai';
import * as sinon from 'sinon';
import { BoardExplorerService } from './board-explorer.service';
import { ChatService } from './chat.service';
import { DebugCommandService } from './debug-command.service';
import { DictionaryService } from './dictionary.service';
import { PutLogicService } from './put-logic.service';
import { ScoreCountService } from './score-count.service';
import { VirtualPlayerService } from './virtual-player.service';

const expect = chai.expect;

describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;
    let dictionaryStub: sinon.SinonStubbedInstance<DictionaryService>;
    let chatStub: sinon.SinonStubbedInstance<ChatService>;
    let boardExplorerStub: sinon.SinonStubbedInstance<BoardExplorerService>;
    let scoreCountStub: sinon.SinonStubbedInstance<ScoreCountService>;
    let putLogicStub: sinon.SinonStubbedInstance<PutLogicService>;
    let debugCommandStub: sinon.SinonStubbedInstance<DebugCommandService>;

    let gameServerStub: sinon.SinonStubbedInstance<GameServer>;
    let player: Player;

    let mockBoard: Tile[][] = [];
    let mockLetterStand: string[] = [];
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

        service = new VirtualPlayerService(
            dictionaryStub,
            chatStub,
            boardExplorerStub,
            scoreCountStub,
            putLogicStub,
            debugCommandStub,
        );

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

        mockLetterStand = ['a', 'r', 'f', 'l', 'e', 's', 'i'];

        mockTileStand[0] = new Tile();
        mockTileStand[0].letter = new Letter();
        mockTileStand[0].letter.value = 'a';

        mockTileStand[1] = new Tile();
        mockTileStand[1].letter = new Letter();
        mockTileStand[1].letter.value = 'r';

        mockTileStand[2] = new Tile();
        mockTileStand[2].letter = new Letter();
        mockTileStand[2].letter.value = 'f';

        mockTileStand[3] = new Tile();
        mockTileStand[3].letter = new Letter();
        mockTileStand[3].letter.value = 'l';

        mockTileStand[4] = new Tile();
        mockTileStand[4].letter = new Letter();
        mockTileStand[4].letter.value = 'e';

        mockTileStand[5] = new Tile();
        mockTileStand[5].letter = new Letter();
        mockTileStand[5].letter.value = 's';

        mockTileStand[6] = new Tile();
        mockTileStand[6].letter = new Letter();
        mockTileStand[6].letter.value = 'i';

        player.stand = mockTileStand;
    });

    it('should be created', () => {
        expect(service).to.equal(service);
    });

    it('should return position before (horizontal case)', () => {
        const pos: Vec2 = { x: 2, y: 2 };
        service['direction'] = 'horizontal';

        const beforePos = service['before'](pos);
        const expectedPos = { x: 2, y: 1 };

        expect(beforePos.x).to.equal(expectedPos.x);
        expect(beforePos.y).to.equal(expectedPos.y);
    });

    it('should return position before (vertical case)', () => {
        const pos: Vec2 = { x: 2, y: 2 };
        service['direction'] = 'vertical';

        const beforePos = service['before'](pos);
        const expectedPos = { x: 1, y: 2 };

        expect(beforePos.x).to.equal(expectedPos.x);
        expect(beforePos.y).to.equal(expectedPos.y);
    });

    it('should return position after (horizontal case)', () => {
        const pos: Vec2 = { x: 2, y: 2 };
        service['direction'] = 'horizontal';

        const afterPos = service['after'](pos);
        const expectedPos = { x: 2, y: 3 };

        expect(afterPos.x).to.equal(expectedPos.x);
        expect(afterPos.y).to.equal(expectedPos.y);
    });

    it('should return position after (vertical case)', () => {
        const pos: Vec2 = { x: 2, y: 2 };
        service['direction'] = 'vertical';

        const afterPos = service['after'](pos);
        const expectedPos = { x: 3, y: 2 };

        expect(afterPos.x).to.equal(expectedPos.x);
        expect(afterPos.y).to.equal(expectedPos.y);
    });

    it('should return position above (horizontal case)', () => {
        const pos: Vec2 = { x: 2, y: 2 };
        service['direction'] = 'horizontal';

        const abovePos = service['above'](pos);
        const expectedPos = { x: 1, y: 2 };

        expect(abovePos.x).to.equal(expectedPos.x);
        expect(abovePos.y).to.equal(expectedPos.y);
    });

    it('should return position above (vertical case)', () => {
        const pos: Vec2 = { x: 2, y: 2 };
        service['direction'] = 'vertical';

        const abovePos = service['above'](pos);
        const expectedPos = { x: 2, y: 1 };

        expect(abovePos.x).to.equal(expectedPos.x);
        expect(abovePos.y).to.equal(expectedPos.y);
    });

    it('should return position below (horizontal case)', () => {
        const pos: Vec2 = { x: 2, y: 2 };
        service['direction'] = 'horizontal';

        const belowPos = service['below'](pos);
        const expectedPos = { x: 3, y: 2 };

        expect(belowPos.x).to.equal(expectedPos.x);
        expect(belowPos.y).to.equal(expectedPos.y);
    });

    it('should return position below (vertical case)', () => {
        const pos: Vec2 = { x: 2, y: 2 };
        service['direction'] = 'vertical';

        const belowPos = service['below'](pos);
        const expectedPos = { x: 2, y: 3 };

        expect(belowPos.x).to.equal(expectedPos.x);
        expect(belowPos.y).to.equal(expectedPos.y);
    });

    it('should return true (inbounds)', () => {
        const pos = { x: 1, y: 1 };
        expect(service['inBounds'](pos, mockBoard)).to.be.equal(true);
    });

    it('isAdjacent should return true', () => {
        const pos = { x: 1, y: 3 };
        expect(service['isAdjacent'](pos, mockBoard)).to.be.equal(true);
    });

    it('isAdjacent should return false', () => {
        const pos = { x: 3, y: 1 };
        expect(service['isAdjacent'](pos, mockBoard)).to.equal(false);
    });

    it('removeLetterFromStand should remove a letter from stand', () => {
        const six = 6;
        service['removeLetterFromStand']('a', mockLetterStand);
        expect(mockLetterStand.length).to.equal(six);
        mockLetterStand.push('a');
    });

    it('findAnchorSquares should find at least 1 anchor square in non empty board', () => {
        service['findAnchorSquares'](mockBoard);
        expect(service['anchorSquares'].length).to.be.greaterThan(0);
    });

    it('findAnchorSquares should find at least 1 anchor square in empty board (h8 square)', () => {
        const emptyMockBoard = [
            [emptyTileStub, emptyTileStub, emptyTileStub],
            [emptyTileStub, emptyTileStub, emptyTileStub],
            [emptyTileStub, emptyTileStub, emptyTileStub],
        ];
        service['findAnchorSquares'](emptyMockBoard);
        expect(service['anchorSquares'].length).to.be.greaterThan(0);
    });

    it('searchValidEntries returns false for invalid entry', () => {
        const pos: Vec2 = { x: 1, y: 1 };
        const validLetters: Set<string> = new Set<string>();
        validLetters.add('a');
        service['validEntries'].set(pos, validLetters);
        expect(service['searchValidEntries']('b', pos)).to.be.equal(false);
    });

    it('searchValidEntries returns true for valid entry', () => {
        const pos: Vec2 = { x: 1, y: 1 };
        const validLetters: Set<string> = new Set<string>();
        validLetters.add('a');
        service['validEntries'].set(pos, validLetters);
        expect(service['searchValidEntries']('a', pos)).to.be.equal(true);
    });

    it('isInStand returns true if letter in stand', () => {
        expect(service['isInStand']('a', mockLetterStand)).to.be.equal(true);
    });

    it('isInStand returns false if letter not in stand', () => {
        expect(service['isInStand']('z', mockLetterStand)).to.be.equal(false);
    });

    it('isInAnchorSquares returns true if pos in anchorSquares', () => {
        service['anchorSquares'] = [
            { x: 1, y: 1 },
            { x: 2, y: 3 },
        ];
        expect(service['isInAnchorSquare']({ x: 1, y: 1 })).to.be.equal(true);
    });

    it('isInAnchorSquares returns false if pos not in anchorSquares', () => {
        service['anchorSquares'] = [
            { x: 1, y: 1 },
            { x: 2, y: 3 },
        ];
        expect(service['isInAnchorSquare']({ x: 1, y: 2 })).to.be.equal(false);
    });

    it('getPrefix should call inBounds and above', () => {
        const pos = { x: 4, y: 4 };
        const spyInBounds = sinon.spy(service as any, 'inBounds');
        const spyAbove = sinon.spy(service as any, 'above');

        service['getPrefix'](pos, mockBoard);
        sinon.assert.called(spyInBounds);
        sinon.assert.called(spyAbove);
    });

    it('getSuffix should call inBounds and below', () => {
        const pos = { x: 4, y: 4 };
        const spyInBounds = sinon.spy(service as any, 'inBounds');
        const spyBelow = sinon.spy(service as any, 'below');

        service['getSuffix'](pos, mockBoard);
        sinon.assert.called(spyInBounds);
        sinon.assert.called(spyBelow);
    });

    it('computeCrossChecks for non empty board should add to validEntries Map', () => {
        service['validEntries'] = service['computeCrossChecks'](mockBoard, gameServerStub.trie);
        expect(service['validEntries'].size).to.be.greaterThan(0);
    });

    it('computeCrossChecks should add char that creates valid cross-word', () => {
        dictionaryStub.containsWord.returns(true);
        service['validEntries'] = service['computeCrossChecks'](mockBoard, gameServerStub.trie);
        expect(service['validEntries'].size).to.be.greaterThan(0);

        dictionaryStub.containsWord.restore();
    });

    it('leftPart should call extendRight', () => {
        const trie = new Trie();
        const spyExtendRight = sinon.spy(service as any, 'extendRight');

        service['leftPart']('', trie.root, 1, { x: 1, y: 1 }, gameServerStub, mockLetterStand);
        sinon.assert.called(spyExtendRight);
    });

    it('leftPart should recursively call leftPart', () => {
        const trie = new Trie();
        trie.add('word');
        const spyLeftPart = sinon.spy(service as any, 'leftPart');

        const isInStandStub = sinon.stub(service as any, 'isInStand').returns(true);

        service['leftPart']('', trie.root, 1, { x: 1, y: 1 }, gameServerStub, mockLetterStand);
        sinon.assert.called(spyLeftPart);

        isInStandStub.restore();
    });

    it('extendRight should call addMove', () => {
        const trie = new Trie();
        trie.add('word');
        trie.root.isFinal = true;
        const stubAddMove = sinon.stub(service as any, 'addMove');

        const isInStandStub = sinon.stub(service as any, 'isInStand').returns(true);
        const searchValidEntriesStub = sinon.stub(service as any, 'searchValidEntries').returns(true);
        service['extendRight']('word', trie.root, { x: 3, y: 1 }, true, gameServerStub, mockLetterStand);
        sinon.assert.called(stubAddMove);

        isInStandStub.restore();
        searchValidEntriesStub.restore();
    });

    it('extendRight calls extend right if letter at pos is defined', () => {
        const pos = { x: 4, y: 4 };
        const trie = new Trie();
        trie.add('trie');

        const spyExtendRight = sinon.spy(service as any, 'extendRight');
        service['extendRight']('', trie.root, pos, false, gameServerStub, mockLetterStand);
        sinon.assert.called(spyExtendRight);
    });

    it('convertPosToCommand should return non-empty command', () => {
        const pos = { x: 2, y: 1 };
        const direction = 'vertical';
        const command = service['convertPosToCommand'](pos, direction);
        expect(command.length).to.be.greaterThan(0);
    });

    it('computeMoveScore computes a score', () => {
        service['computeMoveScore']('word', 'h8h', gameServerStub);
        sinon.assert.called(putLogicStub.boardLogicUpdate);
        sinon.assert.called(scoreCountStub.countScoreArray);
        sinon.assert.called(boardExplorerStub.getWordArray);
        sinon.assert.called(putLogicStub.boardLogicRemove);
    });

    it('computeMoveScore computes a score and iterates wordArray', () => {
        boardExplorerStub.getWordArray.returns([[tileStub, tileStub, tileStub]]);
        service['computeMoveScore']('word', 'h8h', gameServerStub);

        sinon.assert.called(putLogicStub.boardLogicUpdate);
        sinon.assert.called(scoreCountStub.countScoreArray);
        sinon.assert.called(boardExplorerStub.getWordArray);
        sinon.assert.called(putLogicStub.boardLogicRemove);
    });

    it('addMove calls assignMove vertical case', () => {
        const pos = { x: 2, y: 2 };
        const word = 'word';
        const spyAssignMove = sinon.spy(service, 'assignMove');

        service['addMove'](pos, word, 'vertical', gameServerStub, mockLetterStand);
        sinon.assert.called(spyAssignMove);
    });

    it('addMove calls assignMove horizontal case', () => {
        const pos = { x: 2, y: 2 };
        const word = 'word';
        const spyAssignMove = sinon.spy(service, 'assignMove');

        service['addMove'](pos, word, 'horizontal', gameServerStub, mockLetterStand);
        sinon.assert.called(spyAssignMove);
    });

    it('assignMove does not add move if score > 18', () => {
        const number = 19;
        const mockMove = new Move(number, '', [''], '', []);
        service.assignMove(mockMove);
        expect(service['moves'].length).to.equal(0);
    });

    it('assignMove adds move if score <= 6', () => {
        const number = 5;
        const mockMove = new Move(number, '', [''], '', []);
        service.assignMove(mockMove);
        expect(service['moves'][0].length).to.equal(1);
    });

    it('assignMove adds move if score > 6 and score < 13', () => {
        const number = 8;
        const mockMove = new Move(number, '', [''], '', []);
        service.assignMove(mockMove);
        expect(service['moves'][1].length).to.equal(1);
    });

    it('getPartialWord should return non empty string', () => {
        const pos = { x: 4, y: 5 };
        service['direction'] = 'horizontal';

        const partialWord = service['getPartialWord'](pos, mockBoard);
        expect(partialWord.length).to.be.greaterThan(0);
    });

    it('getLimit should return limit greater than 0 if conditions are met', () => {
        const pos = { x: 3, y: 2 };

        const limit = service['getLimit'](pos, mockBoard);
        expect(limit).to.be.greaterThan(0);
    });

    it('generateMoves should call extendRight from leftPart', () => {
        const spyExtendRight = sinon.spy(service as any, 'extendRight');
        // service.trie = new Trie();
        // service.trie.add('word');

        service.generateMoves(gameServerStub, player);
        sinon.assert.called(spyExtendRight);
    });

    it('randomPlacement behavior when there are moves to play (calls placeCommand)', () => {
        const number = 8;
        const mockMove = new Move(number, '', [''], '', []);
        service['moves'] = [];
        service['moves'][0] = [];
        service['moves'][1] = [];
        service['moves'][2] = [];

        service['moves'][0].push(mockMove);
        service['moves'][1].push(mockMove);
        service['moves'][2].push(mockMove);
        service.randomPlacement(gameServerStub, player);
        sinon.assert.called(chatStub.placeCommand);
    });

    it('randomPlacement behavior when there no are moves to play (calls passCommand)', () => {
        // const mockMove = new Move(8, "", [""], "");
        service['moves'] = [];
        service['probability'] = 0.1;

        service.randomPlacement(gameServerStub, player);
        sinon.assert.called(chatStub.passCommand);
    });

    it('randomPlacement behavior when there no are moves to play (calls passCommand)', () => {
        // const mockMove = new Move(8, "", [""], "");
        service['moves'] = [];
        service['probability'] = 0.5;

        service.randomPlacement(gameServerStub, player);
        sinon.assert.called(chatStub.passCommand);
    });

    it('randomPlacement behavior when there no are moves to play (calls passCommand)', () => {
        // const mockMove = new Move(8, "", [""], "");
        service['moves'] = [];
        service['probability'] = 0.8;

        service.randomPlacement(gameServerStub, player);
        sinon.assert.called(chatStub.passCommand);
    });
});
