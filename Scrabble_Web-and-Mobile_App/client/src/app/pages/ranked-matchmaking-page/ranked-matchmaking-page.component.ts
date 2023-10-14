import { Component } from '@angular/core';
import { RankedService } from '@app/services/ranked.service';
import { SocketService } from '@app/services/socket.service';
import { TimerService } from '@app/services/timer.service';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-ranked-matchmaking-page',
    templateUrl: './ranked-matchmaking-page.component.html',
    styleUrls: ['./ranked-matchmaking-page.component.scss'],
})
export class RankedMatchmakingPageComponent {
    constructor(
        public userService: UserService,
        public timerService: TimerService,
        private socketService: SocketService,
        public rankedService: RankedService,
    ) {
        this.timerService.clearTimer();
        this.timerService.clearMatchmakingTimer();
        this.timerService.startMatchmakingTimer();
    }

    acceptMatch() {
        this.rankedService.matchAccepted = true;
        this.socketService.socket.emit('acceptMatch', this.userService.user);
    }
    refuseMatch() {
        this.timerService.clearTimer();
        this.timerService.clearMatchmakingTimer();
        this.socketService.socket.emit('refuseMatch', this.userService.user);
    }
}
