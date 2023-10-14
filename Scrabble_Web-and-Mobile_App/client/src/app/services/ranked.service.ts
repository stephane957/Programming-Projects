import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TimerService } from '@app/services/timer.service';

@Injectable({
    providedIn: 'root',
})
export class RankedService {
    matchAccepted: boolean;
    isShowModal: boolean;
    constructor(public timerService: TimerService, private router: Router) {
        this.isShowModal = false;
    }

    matchHasBeenFound() {
        this.matchAccepted = false;
        const timerTime = 0.25;
        this.isShowModal = true;
        this.timerService.startTimer(timerTime);
    }
    closeModal() {
        this.timerService.clearTimer();
        this.isShowModal = false;
        if (this.matchAccepted === false) {
            this.router.navigate(['/ranked-init']);
        }
        // this.matchAccepted = false;
    }
}
