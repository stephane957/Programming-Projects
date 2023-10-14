import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    displayTimer: string = '';
    secondsValue: number = 0;
    private timerInterval: NodeJS.Timeout;

    startTimer(minutesByTurn: number) {
        if (minutesByTurn < 0) {
            return;
        }

        const secondsInMinute = 60;
        this.secondsValue = minutesByTurn * secondsInMinute;

        const displayZero = 9;
        const oneSecond = 1000;
        this.timerInterval = setInterval(() => {
            this.secondsValue--;
            if (this.secondsValue % secondsInMinute <= displayZero) {
                this.displayTimer = `Temps Restant : ${Math.floor(this.secondsValue / secondsInMinute)}:0${this.secondsValue % secondsInMinute}`;
            } else {
                this.displayTimer = `Temps Restant : ${Math.floor(this.secondsValue / secondsInMinute)}:${this.secondsValue % secondsInMinute}`;
            }
        }, oneSecond);
    }

    clearTimer() {
        clearInterval(this.timerInterval);
    }
}
