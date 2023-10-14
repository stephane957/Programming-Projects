/*eslint-disable */
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { GameServer } from './game-server';

describe('GameServer', () => {
    let gameServer: GameServer = new GameServer(1, false, 'Multi', true, '');

    const mockBonuses = ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx',
    ];

    beforeEach(() => {
        gameServer = new GameServer(1, false, 'Multi', true, '');
    });

    it('should be created', () => {
        expect(gameServer).to.be.ok;
    });
    it('should call setMockTiles', () => {
        const setMockTilesSpy = Sinon.stub(gameServer as any, 'setMockTiles');
        gameServer['initializeBonusBoard']();
        Sinon.assert.called(setMockTilesSpy);
    });
    it('should not call setMockTiles', () => {
        const initializeBonusesArraySpy = Sinon.stub(gameServer as any, 'initializeBonusesArray');
        gameServer['initializeBonusBoard']();
        Sinon.assert.notCalled(initializeBonusesArraySpy);
    });

    it('should call setMockTiles with randomBonusesOn is true', () => {
        const initializeBonusesArraySpy = Sinon.stub(gameServer as any, 'initializeBonusesArray');
        const generateNumberStub =
            Sinon.stub(gameServer as any, 'generateRandomNumber').returns(0);
        gameServer.randomBonusesOn = true;
        gameServer.bonuses = mockBonuses;
        gameServer['initializeBonusBoard']();
        Sinon.assert.called(initializeBonusesArraySpy);
        generateNumberStub.restore(); initializeBonusesArraySpy.restore();
    });

    it('initializeBonusesArray returns should be equal to "z"', () => {
        const mapBonuses = new Map(); mapBonuses.set('z', 3);
        gameServer['initializeBonusesArray'](mapBonuses);
        expect(gameServer.bonuses[0]).to.equal('z');
    });

    it('should have random number greater than -1 and less than 62', () => {
        for (let i = 0; i < 1000; i++) {
            const result = gameServer['generateRandomNumber']();
            expect(result).to.be.greaterThan(-1);
            expect(result).to.be.lessThan(62);
        }
    });

    it("setObjectivePlayer() should set the playerId", () => {
        gameServer.setObjectivePlayer("test");
        gameServer.objectivesOfGame[0].playerId = '';
        expect(gameServer.gameMode).to.equal('Multi');
    });
});
