import { AfterViewInit, Component, Optional, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { InfoClientService } from '@app/services/info-client.service';
import { UserService } from '@app/services/user.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements AfterViewInit {
    @ViewChild('name') name: NgModel;
    @ViewChild('form') form: NgForm;

    expansionPanelStyleClassic: string;

    constructor(
        public infoClientService: InfoClientService,
        private userService: UserService,
        private socketService: SocketService,
        @Optional() public dialog?: MatDialog,
    ) {}

    async ngAfterViewInit(): Promise<void> {
        const cookie = localStorage.getItem('cookie');
        if (cookie) {
            await this.userService.softLogin(this.socketService.socket);
        }
    }
}
