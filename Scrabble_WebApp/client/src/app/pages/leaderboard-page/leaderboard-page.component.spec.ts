/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LeaderboardPageComponent } from './leaderboard-page.component';

describe('LeaderboardPageComponent', () => {
    let component: LeaderboardPageComponent;
    let fixture: ComponentFixture<LeaderboardPageComponent>;
    let routerSpyObj: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [LeaderboardPageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: Router, useValue: routerSpyObj }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LeaderboardPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
