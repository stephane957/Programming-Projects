/* eslint-disable*/
import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import { UserService } from '@app/services/user.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-mode-options-page',
    templateUrl: './game-mode-options-page.component.html',
    styleUrls: ['./game-mode-options-page.component.scss'],
})
export class GameModeOptionsPageComponent {
    constructor(
        private infoClientService: InfoClientService,
        private socketService: SocketService,
        public userService: UserService,
    ) {
        this.socketService.socket.emit("getAllChatRooms");
    }

    setGameMode(gameMode: string) {
        this.infoClientService.gameMode = gameMode;
    }

    async logOut() {
        await this.userService.logout();
    }

}
