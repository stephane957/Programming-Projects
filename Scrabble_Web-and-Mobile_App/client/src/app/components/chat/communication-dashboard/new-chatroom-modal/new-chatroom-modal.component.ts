import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GalleryComponent } from '@app/components/gallery/gallery.component';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-new-chatroom-modal',
    templateUrl: './new-chatroom-modal.component.html',
    styleUrls: ['./new-chatroom-modal.component.scss'],
})
export class NewChatroomModalComponent {
    @ViewChild(GalleryComponent) galleryComponent: GalleryComponent;

    name = '';

    constructor(private dialog: MatDialog, private socketService: SocketService) {}

    async newChatroom(newChatRoomName: string) {
        this.name = newChatRoomName;
        this.socketService.socket.emit('createChatRoom', newChatRoomName);
        this.dialog.closeAll();
    }

    closeDialog() {
        this.dialog.closeAll();
    }
}
