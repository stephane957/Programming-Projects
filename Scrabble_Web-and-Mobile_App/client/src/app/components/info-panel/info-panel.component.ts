import { Component } from '@angular/core';
import { DrawingService } from '@app/services/drawing.service';
import { InfoClientService } from '@app/services/info-client.service';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';
import { UserService } from '@app/services/user.service';
import * as Constants from '@app/classes/global-constants';
import { ConfirmWindowComponent } from '@app/components/confirm-window/confirm-window.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '@app/services/notification.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-info-panel',
    templateUrl: './info-panel.component.html',
    styleUrls: ['./info-panel.component.scss'],
})
export class InfoPanelComponent {
    enter: string = 'Enter';
    coordsTileToChange: string;
    letterFromReserveChoosed: string;
    idxTileFromStandChoosed: number;

    constructor(
        public drawingService: DrawingService,
        public socketService: SocketService,
        public placeGraphicService: PlaceGraphicService,
        public infoClientService: InfoClientService,
        public userService: UserService,
        private translate: TranslateService,
        private dialog: MatDialog,
        private notifService: NotificationService,
        private router: Router,
    ) {
        this.coordsTileToChange = '';
    }

    onExchangeClick() {
        this.socketService.socket.emit('onExchangeClick');
    }
    onCancelClick() {
        this.socketService.socket.emit('onAnnulerClick');
    }

    skipTurnButton() {
        this.socketService.socket.emit('turnFinished');
        this.infoClientService.isTurnOurs = false;
    }

    onClickGiveUpButton() {
        if (this.infoClientService.isSpectator) {
            return;
        }

        if (this.infoClientService.game.gameFinished) {
            this.notifService.openSnackBar(this.translate.instant('GAME.SIDEBAR.GAME_FINISHED'), false);
            return;
        }

        this.infoClientService.hasAskedForLeave = true;
        const dialogRef = this.dialog.open(ConfirmWindowComponent, {
            height: '25%',
            width: '20%',
            panelClass: 'matDialogWheat',
        });

        dialogRef.componentInstance.name = this.translate.instant('GAME.SIDEBAR.GIVE_UP_GAME_QUESTION');

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.socketService.count = 1;
                this.socketService.socket.emit('giveUpGame');
                this.router.navigate(['/game-mode-options']);
            } else {
                this.infoClientService.hasAskedForLeave = false;
            }
        });
    }

    shouldLeaveGameBe() {
        if (this.infoClientService.isSpectator || this.infoClientService.game.gameFinished || !this.infoClientService.game.gameStarted) {
            return true;
        }

        let answer = true;
        // TODO Will it break game?
        if (this.infoClientService.displayTurn !== this.translate.instant('GAME.SIDEBAR.WAITING_PLAYERS')) {
            answer = false;
        }
        return answer;
    }

    leaveGame() {
        this.infoClientService.hasAskedForLeave = true;
        const dialogRef = this.dialog.open(ConfirmWindowComponent, {
            height: '18%',
            width: '20%',
            panelClass: 'matDialogWheat',
        });

        dialogRef.componentInstance.name = this.translate.instant('GAME.DO_YOU_WANT_QUIT');

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (this.infoClientService.game.gameMode === 'Ranked' && this.infoClientService.game.gameFinished) {
                    this.socketService.count = 1;
                    this.socketService.socket.emit('leaveRankedGame', [this.infoClientService.player.name, this.infoClientService.player.elo]);
                }
                this.socketService.socket.emit('leaveGame');
                this.socketService.count = 1;
                this.router.navigate(['/game-mode-options']);
            } else {
                this.infoClientService.hasAskedForLeave = false;
            }
        });
    }

    startGame() {
        this.socketService.socket.emit('startGame', this.infoClientService.game.roomName);
        this.infoClientService.creatorShouldBeAbleToStartGame = false;
    }

    shouldSpecBeAbleToBePlayer() {
        if (this.infoClientService.game.gameFinished || !this.infoClientService.isSpectator) {
            return false;
        }
        const nbVirtualPlayer = Array.from(this.infoClientService.actualRoom.players).filter((player) => player.id === 'virtualPlayer').length;
        if (nbVirtualPlayer > 0) {
            return true;
        } else {
            return false;
        }
    }

    spectWantsToBePlayer() {
        this.socketService.socket.emit('spectWantsToBePlayer');
    }

    showPowerList() {
        this.infoClientService.displayPowerModal = 'block';
    }

    hidePowerModal() {
        this.infoClientService.displayPowerModal = 'none';
    }

    onPowerCardClick(powerCardName: string) {
        this.socketService.socket.emit('requestLetterReserve');
        switch (powerCardName) {
            case Constants.TRANFORM_EMPTY_TILE: {
                this.infoClientService.displayTransformTileModal = 'block';
                break;
            }
            case Constants.EXCHANGE_LETTER_JOKER: {
                this.infoClientService.displayExchLetterModal = 'block';
                break;
            }
            case Constants.EXCHANGE_STAND: {
                this.infoClientService.displayExchStandModal = 'block';
                break;
            }
            default: {
                this.infoClientService.powerUsedForTurn = true;
                this.socketService.socket.emit('powerCardClick', powerCardName, '');
                break;
            }
        }
        this.hidePowerModal();
    }

    onExchangeStandChoice(playerName: string) {
        this.infoClientService.powerUsedForTurn = true;
        this.socketService.socket.emit('powerCardClick', Constants.EXCHANGE_STAND, playerName);
        this.infoClientService.displayExchStandModal = 'none';
    }
    onChooseLetterToExchange(id: number) {
        this.idxTileFromStandChoosed = id;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const letterElement = document.getElementById(id.toString())!;
        letterElement.style.backgroundColor = '#0C483F';
        letterElement.style.color = 'wheat';
        for (let i = 0; i < this.infoClientService.player.stand.length; i++) {
            if (i === id) {
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const otherLetterElement = document.getElementById(i.toString())!;
            otherLetterElement.style.backgroundColor = 'wheat';
            otherLetterElement.style.color = '#0C483F';
        }
    }
    onChooseLetterToTakeFromReserve(id: number, choosedLetter: string) {
        this.letterFromReserveChoosed = choosedLetter;
        const addOnForReserve = 7;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const letterElement = document.getElementById((id + addOnForReserve).toString())!;
        letterElement.style.backgroundColor = '#0C483F';
        letterElement.style.color = 'wheat';
        for (let i = 0; i < this.infoClientService.letterReserve.length; i++) {
            if (i === id) {
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const otherLetterElement = document.getElementById((i + addOnForReserve).toString())!;
            otherLetterElement.style.backgroundColor = 'wheat';
            otherLetterElement.style.color = '#0C483F';
        }
    }

    activateLetterExchange() {
        const additionalParams = this.letterFromReserveChoosed + this.idxTileFromStandChoosed.toString();
        this.socketService.socket.emit('powerCardClick', Constants.EXCHANGE_LETTER_JOKER, additionalParams);
        this.infoClientService.powerUsedForTurn = true;
        this.infoClientService.displayExchLetterModal = 'none';
    }

    validateTileChangeCoords() {
        const idxLine: number =
            this.coordsTileToChange.slice(0, Constants.END_POSITION_INDEX_LINE).toLowerCase().charCodeAt(0) - Constants.ASCII_CODE_SHIFT;
        const idxColumn = Number(this.coordsTileToChange.slice(Constants.END_POSITION_INDEX_LINE, this.coordsTileToChange.length));
        if (
            !idxLine ||
            !idxColumn ||
            idxLine <= 0 ||
            idxColumn <= 0 ||
            idxLine > Constants.NUMBER_SQUARE_H_AND_W ||
            idxColumn > Constants.NUMBER_SQUARE_H_AND_W
        ) {
            this.notifService.openSnackBar(this.translate.instant('GAME.SIDEBAR.INVALID_COORDINATES'), false);
            return;
        }
        if (this.infoClientService.game.board[idxLine][idxColumn].letter.value !== '') {
            this.notifService.openSnackBar(this.translate.instant('GAME.SIDEBAR.NOT_EMPTY_TILE'), false);
            return;
        }
        if (this.infoClientService.game.board[idxLine][idxColumn].bonus !== 'xx') {
            this.notifService.openSnackBar(this.translate.instant('GAME.SIDEBAR.NOT_EMPTY_BONUS_TILE'), false);
            return;
        }
        this.socketService.socket.emit('powerCardClick', Constants.TRANFORM_EMPTY_TILE, idxLine.toString() + '-' + idxColumn.toString());
        this.infoClientService.powerUsedForTurn = true;
        this.infoClientService.displayTransformTileModal = 'none';
    }

    translateCardName(name: string) {
        const nameTranslated = this.translate.instant('POWERS.' + name);
        return nameTranslated;
    }
}
