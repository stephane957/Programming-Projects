import { Injectable } from '@angular/core';
import { Score } from '@app/classes/score';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class LeaderBoardService {
    scoreClassic: Score[];
    scoreLOG2990: Score[];

    constructor(private socketService: SocketService) {
        if (socketService !== null) {
            this.socketService.socket.on('sendScoreDb', (classic: Score[], log2990: Score[]) => this.handleSocket(classic, log2990));
            return;
        }
        this.scoreClassic = [];
        this.scoreLOG2990 = [];
    }

    refreshDb() {
        this.socketService.socket.emit('dbReception');
    }

    private handleSocket(classic: Score[], log2990: Score[]) {
        this.scoreClassic = classic;
        this.scoreLOG2990 = log2990;
    }
}
