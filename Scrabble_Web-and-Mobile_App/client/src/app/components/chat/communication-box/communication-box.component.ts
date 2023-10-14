import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChatMessage } from '@app/classes/chat-message';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import * as Constants from '@app/classes/global-constants';
import { ChatRoom } from '@app/classes/chatroom.interface';
import { SocketService } from '@app/services/socket.service';
@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
})
export class CommunicationBoxComponent implements AfterViewInit {
    @Input() actualChatRoom: ChatRoom;
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    @ViewChildren('commands') itemElements: QueryList<Element>;

    inputInComBox: string = '';
    private scrollContainer: Element;

    constructor(
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        public infoClientService: InfoClientService,
        private socketService: SocketService,
    ) {}

    ngAfterViewInit() {
        this.scrollContainer = this.scrollFrame.nativeElement;
        // we weren't able to find an equivalent without using using subscribe
        // nothing was working for this specific case
        // eslint-disable-next-line deprecation/deprecation
        this.itemElements.changes.subscribe(() => this.scrollToBottom());
    }

    onLeftClickComBox(): void {
        this.mouseKeyboardEventHandler.onCommunicationBoxLeftClick();
    }

    // function that shows the content of the input, the place in the message array
    // and delete the input field
    onEnterComBox(): void {
        if (!this.mouseKeyboardEventHandler.isCommunicationBoxFocus) {
            return;
        }
        this.mouseKeyboardEventHandler.onCommunicationBoxEnter(this.inputInComBox, this.actualChatRoom.name);
        (document.getElementById('inputCommBox') as HTMLInputElement).value = '';
    }

    isCreator() {
        return this.infoClientService.playerName === this.actualChatRoom.creator && this.actualChatRoom.name !== 'game';
    }

    chooseMsgClass(msg: ChatMessage): string {
        if (msg.senderName === this.infoClientService.playerName) {
            return 'msgPlayer';
        } else if (msg.senderName === Constants.SYSTEM_SENDER) {
            return 'msgSystem';
        } else {
            return 'msgOpponent';
        }
    }

    chooseMsgClassAvatar(msg: ChatMessage): string {
        if (msg.senderName === this.infoClientService.playerName) {
            return 'msgPlayerAvatar';
        } else if (msg.senderName === Constants.SYSTEM_SENDER) {
            return 'msgSystemAvatar';
        } else {
            return 'msgOpponentAvatar';
        }
    }

    deleteChatRoom() {
        this.socketService.socket.emit('deleteChatRoom', this.actualChatRoom.name);
    }

    convertTimestamp(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    }

    getPlayerHistory() {
        if (this.actualChatRoom.name === 'game') {
            const chatHistory = this.infoClientService.actualRoom.players.find(
                (player) => player.name === this.infoClientService.playerName,
            )?.chatHistory;
            if (chatHistory) {
                return chatHistory;
            } else {
                return [];
            }
        } else {
            return this.actualChatRoom.chatHistory;
        }
    }
    getSpecHistory() {
        if (this.actualChatRoom.name === 'game') {
            const chatHistory = this.infoClientService.actualRoom.spectators.find(
                (spec) => spec.name === this.infoClientService.playerName,
            )?.chatHistory;
            if (chatHistory) {
                return chatHistory;
            }
        }
        return [];
    }

    private scrollToBottom(): void {
        this.scrollContainer.scroll({
            top: this.scrollContainer.scrollHeight,
            left: 0,
            behavior: 'auto',
        });
    }
}
