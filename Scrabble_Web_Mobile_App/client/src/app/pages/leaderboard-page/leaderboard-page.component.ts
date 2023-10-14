import { Component, OnInit } from '@angular/core';
import { LeaderBoardService } from '@app/services/leader-board.service';

@Component({
    selector: 'app-leaderboard-page',
    templateUrl: './leaderboard-page.component.html',
    styleUrls: ['./leaderboard-page.component.scss'],
})
export class LeaderboardPageComponent implements OnInit {
    constructor(public leaderBoardService: LeaderBoardService) {}

    ngOnInit(): void {
        this.leaderBoardService.refreshDb();
    }
}
