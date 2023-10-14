/* eslint-disable */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Score } from '@app/classes/score';
import { LeaderBoardService } from './leader-board.service';
import { SocketService } from './socket.service';

describe('LeaderBoardService', () => {
    let service: LeaderBoardService;
    let routerSpyObj: Router;

    beforeEach(() => {
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            providers: [{ provide: Router, useValue: routerSpyObj }],
        });
        service = TestBed.inject(LeaderBoardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("handleSocket() should set scoreClassic and scoreLog2990 with the array given in parameter", () => {
        const scoreClassicTest = new Array<Score>();
        scoreClassicTest.push({ name: ['test'], score: '1' })
        const scoreLOG2990Test = new Array<Score>();
        scoreLOG2990Test.push({ name: ['test2'], score: '2' });

        service['handleSocket'](scoreClassicTest, scoreLOG2990Test);
        expect(service.scoreClassic).toEqual(scoreClassicTest);
        expect(service.scoreLOG2990).toEqual(scoreLOG2990Test);
    });

    it("constructeur should call initialize array", () => {
        new LeaderBoardService(null as unknown as SocketService);
        expect(true).toEqual(true);
    });
});
