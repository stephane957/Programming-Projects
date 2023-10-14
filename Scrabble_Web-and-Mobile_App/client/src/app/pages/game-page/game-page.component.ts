import { Component, OnInit, OnDestroy } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { SocketService } from '@app/services/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { EndGameResultsPageComponent } from '@app/pages/end-game-results-page/end-game-results-page.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    socketSubscription: Subscription;
    routerSubscription: Subscription;
    constructor(
        private socketService: SocketService,
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        public infoClientService: InfoClientService,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.socketSubscription = this.socketService.gameFinished.subscribe((value) => {
            // eslint-disable-next-line no-constant-condition
            if (value) {
                this.dialog.open(EndGameResultsPageComponent, {
                    panelClass: 'matDialogWheat',
                    disableClose: true,
                    hasBackdrop: false,
                    height: '80%',
                    width: '80%',
                });
            }
        });
    }

    ngOnDestroy() {
        this.socketService.gameFinished.next(false);
        if (this.socketSubscription) this.socketSubscription.unsubscribe();
    }

    onLeftClickGamePage() {
        this.mouseKeyboardEventHandler.onLeftClickGamePage();
    }

    isPlayerIncomming() {
        if (this.infoClientService.incommingPlayer === '') {
            return 'none';
        } else {
            return 'block';
        }
    }

    acceptPlayer(isPlayerAccepted: boolean) {
        if (isPlayerAccepted) {
            this.socketService.socket.emit('acceptPlayer', true, this.infoClientService.incommingPlayerId);
        } else {
            this.socketService.socket.emit('acceptPlayer', false, this.infoClientService.incommingPlayerId);
        }

        this.infoClientService.incommingPlayer = '';
        this.infoClientService.incommingPlayerId = '';
    }
}
