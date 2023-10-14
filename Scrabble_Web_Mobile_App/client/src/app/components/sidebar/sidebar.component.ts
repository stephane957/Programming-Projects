/* eslint-disable deprecation/deprecation */
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { Router } from '@angular/router';
import { ModalVpLevelsComponent } from '@app/components/modal-vp-levels/modal-vp-levels.component';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { DrawingService } from '@app/services/drawing.service';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    private fontSize: number;

    constructor(
        private modal: MatDialog,
        private drawingBoardService: DrawingBoardService,
        private drawingService: DrawingService,
        private socketService: SocketService,
        private infoClientService: InfoClientService,
        private router: Router,
    ) {}

    updateSetting(event: MatSliderChange) {
        const eventValue = event.value;
        if (eventValue) {
            this.fontSize = eventValue;
        }
        this.drawingService.canvasStand.beginPath();
        this.drawingService.canvasStand.font = this.fontSize.toString() + 'px bold system-ui';
        this.drawingBoardService.boardCanvas.font = this.fontSize.toString() + 'px bold system-ui';
        const player = this.infoClientService.player;
        if (player) {
            for (const tile of player.stand) {
                this.drawingService.drawOneLetter(tile.letter.value, tile, this.drawingService.canvasStand, this.infoClientService.letterBank);
            }
        }
        this.drawingBoardService.reDrawOnlyTilesBoard(this.infoClientService.game.board, this.infoClientService.letterBank);
    }

    onClickGiveUpButton() {
        if (this.infoClientService.game.gameFinished) {
            alert("La game est finie, plus d'abandon possible.");
            return;
        }
        const resultLeave = confirm('Voulez vous vraiment abandonner la partie ?');
        if (!resultLeave) {
            return;
        }
        this.socketService.socket.emit('giveUpGame');
        this.router.navigate(['/home']);
    }

    finishGameClick() {
        if (!this.infoClientService.game.gameFinished) {
            return;
        }
        this.router.navigate(['/home']);
    }

    shouldConvertSoloBe(): boolean {
        let answer = true;

        if (this.infoClientService.displayTurn !== "En attente d'un autre joueur...") {
            answer = false;
        }
        return answer;
    }

    convertGameInSolo(vpLevel: string) {
        this.infoClientService.vpLevel = vpLevel;
        this.infoClientService.generateNameOpponent(this.infoClientService.playerName);
        this.socketService.socket.emit('convertGameInSolo', this.infoClientService.nameOpponent, vpLevel);
    }

    leaveGame() {
        this.socketService.socket.emit('leaveGame');
        this.infoClientService.actualRoom = '';
    }

    openModal() {
        const modalRef = this.modal.open(ModalVpLevelsComponent, {
            panelClass: 'modalVPContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.convertGameInSolo(result);
        });
    }
}
