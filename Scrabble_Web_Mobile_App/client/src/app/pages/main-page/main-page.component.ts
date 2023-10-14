import { Component, Optional, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import * as GlobalConstants from '@app/classes/global-constants';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    @ViewChild('expansionClassic') classicButtons: MatExpansionPanel;
    @ViewChild('expansionLOG2990') log2990Button: MatExpansionPanel;
    @ViewChild('name') name: NgModel;
    @ViewChild('form') form: NgForm;

    submitted: boolean;
    expansionPanelStyleClassic: string;
    expansionPanelStyleLOG2990: string;

    constructor(private socketService: SocketService, private infoClientService: InfoClientService, @Optional() public dialog?: MatDialog) {
        this.submitted = false;
        this.expansionPanelStyleClassic = 'ExpansionPanelHidden';
        this.expansionPanelStyleLOG2990 = 'ExpansionPanelHidden';
    }

    onSubmit() {
        this.infoClientService.playerName = this.name.value;
        this.socketService.socket.emit('new-user', this.name.value);
        this.submitted = !this.submitted;
    }

    onClickSolo(mode: string) {
        this.infoClientService.gameMode = GlobalConstants.MODE_SOLO;
        this.infoClientService.isLog2990Enabled = mode !== 'classic';
    }

    onClickMulti(mode: string) {
        this.infoClientService.gameMode = GlobalConstants.MODE_MULTI;
        this.infoClientService.isLog2990Enabled = mode !== 'classic';
    }

    toggleClassic(): void {
        this.expansionPanelStyleClassic = this.expansionPanelStyleClassic === 'ExpansionPanelHidden' ? 'ExpansionPanel' : 'ExpansionPanelHidden';
        this.classicButtons.toggle();
    }

    toggleLOG2990(): void {
        this.expansionPanelStyleLOG2990 = this.expansionPanelStyleLOG2990 === 'ExpansionPanelHidden' ? 'ExpansionPanel' : 'ExpansionPanelHidden';
        this.log2990Button.toggle();
    }

    noNameError() {
        if (!this.submitted) {
            alert("Il faut d'abord entrer un nom !");
        }
    }
}
