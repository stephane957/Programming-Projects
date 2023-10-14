import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    constructor(
        private socketService: SocketService,
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        private router: Router,
        public infoClientService: InfoClientService,
    ) {
        // we weren't able to find an equivalent without using using subscribe
        // nothing was working for this specific case
        // pages are handled differently and doesnt fit our functionnality
        // eslint-disable-next-line deprecation/deprecation
        router.events.subscribe((event) => {
            const isAtCorrectPage: boolean = event instanceof NavigationStart && this.router.url === '/game';
            if (isAtCorrectPage && !this.infoClientService.game.gameFinished) {
                const resultLeave = confirm('Voulez vous vraiment quitter cette page ? \nCela équivaudrait à un abandon de partie !');
                if (!resultLeave) {
                    this.router.navigate(['/game']);
                } else {
                    this.socketService.socket.emit('giveUpGame');
                }
            }
        });
    }

    onLeftClickGamePage() {
        this.mouseKeyboardEventHandler.onLeftClickGamePage();
    }
}
