/* eslint-disable */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LeaderBoardService } from './leader-board.service';

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
});
