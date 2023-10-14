/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GameServer } from './game-server';

describe('GameServer', () => {
    let gameServer: GameServer = new GameServer(1, false, 'Multi', false);

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        gameServer = new GameServer(1, false, 'Multi', true);
    });

    it('should be created', () => {
        expect(gameServer).toBeTruthy();
    });

    it('should call setMockTiles', () => {
        const setMockTilesSpy = spyOn<any>(gameServer, 'setMockTiles').and.stub();
        gameServer['initializeBonusBoard']();
        expect(setMockTilesSpy).toHaveBeenCalled();
    });
    it('should not call setMockTiles', () => {
        const initializeBonusesArraySpy = spyOn<any>(gameServer, 'initializeBonusesArray').and.stub();
        gameServer['initializeBonusBoard']();
        expect(initializeBonusesArraySpy).toHaveBeenCalledTimes(0);
    });
    it('should call setMockTiles with randomBonusesOn is true', () => {
        const initializeBonusesArraySpy = spyOn<any>(gameServer, 'initializeBonusesArray').and.callThrough();
        gameServer.randomBonusesOn = true;
        gameServer['initializeBonusBoard']();
        expect(initializeBonusesArraySpy).toHaveBeenCalled();
    });
    it('should have random number greater than -1 and less than 62', () => {
        for (let i = 0; i < 1000; i++) {
            expect(gameServer['generateRandomNumber']()).toBeGreaterThan(-1);
            expect(gameServer['generateRandomNumber']()).toBeLessThan(62);
        }
    });

    it('setObjectivePlayer() should set the playerId', () => {
        gameServer.setObjectivePlayer('test');
        expect(gameServer.gameMode).toEqual('Multi');
    });
});
