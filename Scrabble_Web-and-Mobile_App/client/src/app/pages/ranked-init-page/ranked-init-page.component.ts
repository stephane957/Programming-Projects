import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-ranked-init-page',
    templateUrl: './ranked-init-page.component.html',
    styleUrls: ['./ranked-init-page.component.scss'],
})
export class RankedInitPageComponent {
    eloDisparity: number;
    constructor(public infoClientService: InfoClientService, public userService: UserService, private socketService: SocketService) {
        const baseElodisparity = 60;
        this.eloDisparity = baseElodisparity;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEloDisparityChange(value: any) {
        this.eloDisparity = value.value;
    }
    onConfirm() {
        this.infoClientService.eloDisparity = this.eloDisparity;
        this.startMatchmaking();
    }
    startMatchmaking() {
        this.socketService.socket.emit('startMatchmaking', this.eloDisparity, this.userService.user);
    }
}
