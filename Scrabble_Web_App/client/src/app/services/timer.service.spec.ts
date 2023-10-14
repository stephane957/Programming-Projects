/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        service = TestBed.inject(TimerService);
        service.clearTimer();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should show that there is 55 seconds left 5 seconds after the timer starts', fakeAsync((): void => {
        service.startTimer(1);
        const testVariable = 5000;
        tick(testVariable);
        expect(service.displayTimer).toEqual('Temps Restant : 0:55');
        service.clearTimer();
    }));

    it('should display a 0 if the amount of seconds is under 10 seconds', fakeAsync((): void => {
        service.startTimer(2);
        const testVariable = 55000;
        tick(testVariable);
        expect(service.displayTimer).toEqual('Temps Restant : 1:05');
        service.clearTimer();
    }));

    it('startTimer() should not call setInterval if parameter value is < 0', () => {
        const spySetInterval = spyOn(window, "setInterval");

        service.startTimer(-1);
        expect(spySetInterval).toHaveBeenCalledTimes(0);
    });
});
