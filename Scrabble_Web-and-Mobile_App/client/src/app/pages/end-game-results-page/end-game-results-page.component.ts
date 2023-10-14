import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from '@app/../environments/environment';
import { GameSaved } from '@app/classes/game-saved';
import * as Constants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { ProfileReadOnlyPageComponent } from '@app/pages/profile-page/profile-read-only-page/profile-read-only-page.component';
import { EloChangeService } from '@app/services/elo-change.service';
import { InfoClientService } from '@app/services/info-client.service';
import { NotificationService } from '@app/services/notification.service';
import { SocketService } from '@app/services/socket.service';
import { UserService } from '@app/services/user.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-end-game-results-page',
    templateUrl: './end-game-results-page.component.html',
    styleUrls: ['./end-game-results-page.component.scss'],
})
export class EndGameResultsPageComponent implements OnInit, OnDestroy {
    roomName: string;
    creator: string;
    numberOfTurns: number = 0;
    gameStartDate: string;
    playingTime: string;
    serverUrl = environment.serverUrl;
    players: Player[];
    gameSaved: GameSaved;
    openProfileSubscription: Subscription;
    newPlayersElo: Player[];
    clicked = false;

    constructor(
        private matDialogRefEndGame: MatDialogRef<EndGameResultsPageComponent>,
        public infoClientService: InfoClientService,
        private userService: UserService,
        private dialog: MatDialog,
        private eloChangeService: EloChangeService,
        private socketService: SocketService,
        private notifService: NotificationService,
        private translate: TranslateService,
    ) {}

    ngOnInit() {
        this.roomName = this.infoClientService.actualRoom.name;
        this.players = this.infoClientService.actualRoom.players.copyWithin(0, 0, 3);
        this.orderPlayerByScore();
        this.findNumberOfTurns();
        this.findCreatorOfGame();
        this.getGameStartDate();
        this.displayPlayingTime();
        this.saveGame();
        if (this.infoClientService.gameMode === Constants.MODE_RANKED) {
            this.newPlayersElo = this.eloChangeService.changeEloOfPlayers(this.players);
            this.changeEloOfPlayersDB();
        }
    }

    ngOnDestroy() {
        if (this.openProfileSubscription) this.openProfileSubscription.unsubscribe();
    }

    orderPlayerByScore() {
        this.players = this.players.sort((element1, element2) => element2.score - element1.score);
    }

    openProfilePage(player: Player) {
        this.openProfileSubscription = this.userService.getUserByName(player.name).subscribe({
            next: (res) => {
                this.dialog.open(ProfileReadOnlyPageComponent, {
                    data: {
                        message: 'userFound',
                        userInfo: res.data,
                    },
                    height: '60%',
                    width: '45%',
                    panelClass: 'customDialog',
                });
            },
            error: (error: HttpErrorResponse) => {
                if (error.error instanceof ErrorEvent) {
                    this.notifService.openSnackBar('Erreur: ' + error.status + error.error.message, false);
                } else {
                    this.notifService.openSnackBar(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.error}`, false);
                }
            },
        });
    }

    changeEloOfPlayersDB() {
        for (const player of this.newPlayersElo) {
            this.socketService.socket.emit('changeElo', player.name, player.elo);
        }
    }

    closeModalEndGame() {
        this.matDialogRefEndGame.close();
    }

    lettersOnStand(player: Player): string {
        const listLetterStillOnStand: string[] = new Array<string>();
        for (const tile of player.stand) {
            if (tile.letter.value !== '') {
                listLetterStillOnStand.push(tile.letter.value);
            }
        }
        return listLetterStillOnStand.toString();
    }

    displayPlayingTime(): void {
        const secondsInMinute = 60;
        const displayZero = 9;
        const end = this.infoClientService.game.endTime;
        const begin = this.infoClientService.game.startTime;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const timeInSeconds = (end - begin) / 1000;
        const minutesToDisplay = Math.floor(timeInSeconds / secondsInMinute);
        const secondsToDisplay = Math.floor(timeInSeconds % secondsInMinute);
        if (secondsToDisplay <= displayZero && minutesToDisplay <= displayZero) {
            this.playingTime = `0${minutesToDisplay}:0${secondsToDisplay}`;
        } else if (secondsToDisplay <= displayZero && minutesToDisplay > displayZero) {
            this.playingTime = `${minutesToDisplay}:0${secondsToDisplay}`;
        } else if (secondsToDisplay > displayZero && minutesToDisplay <= displayZero) {
            this.playingTime = `0${minutesToDisplay}:${secondsToDisplay}`;
        } else if (secondsToDisplay > displayZero && minutesToDisplay > displayZero) {
            this.playingTime = `${minutesToDisplay}:${secondsToDisplay}`;
        }
    }

    findNumberOfTurns(): void {
        this.numberOfTurns =
            this.infoClientService.actualRoom.players[0].turn +
            this.infoClientService.actualRoom.players[1].turn +
            this.infoClientService.actualRoom.players[2].turn +
            this.infoClientService.actualRoom.players[3].turn;
    }

    getGameStartDate(): void {
        this.gameStartDate = this.infoClientService.game.gameStart;
    }

    findCreatorOfGame(): void {
        // @ts-ignore
        const creator = this.infoClientService.actualRoom.players.find((player: Player) => {
            if (player.isCreatorOfGame) return player.name;
        });

        if (creator && creator.name) this.creator = creator.name;
        else this.creator = this.translate.instant('RESULT.NO_CREATOR');
    }

    isLinkEnabled(player: Player): boolean {
        return player.id !== 'virtualPlayer';
    }

    saveGame(): void {
        if (this.socketService.socket.id === this.infoClientService.game.masterTimer) {
            this.gameSaved = new GameSaved(
                this.infoClientService.actualRoom.players,
                this.roomName,
                this.numberOfTurns,
                this.gameStartDate,
                this.playingTime,
                this.infoClientService.game.nbLetterReserve,
                this.infoClientService.actualRoom.spectators,
                this.infoClientService.game.winners,
            );
            this.socketService.socket.emit('saveGame', this.gameSaved);
        }
    }

    async addGameToFavourites() {
        await this.userService.updateFavourites(this.socketService.gameId);
    }
}
