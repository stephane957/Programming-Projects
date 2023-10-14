import { AfterViewInit, Component } from '@angular/core';
import { RoomData } from '@app/classes/room-data';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-multiplayer-init-page',
    templateUrl: './multiplayer-init-page.component.html',
    styleUrls: ['./multiplayer-init-page.component.scss'],
})
export class MultiplayerInitPageComponent implements AfterViewInit {
    constructor(private socketService: SocketService, public infoClientService: InfoClientService) {}

    ngAfterViewInit() {
        this.socketService.socket.emit('listRoom');
    }

    onClickGame(roomName: string) {
        this.socketService.socket.emit('joinRoom', {
            roomName,
            playerId: this.socketService.socket.id,
        });
    }

    onClickRandom() {
        // get une liste de toutes les keys des rooms
        const rooms: RoomData[] = this.infoClientService.rooms;
        if (rooms.length > 0) {
            // get random key
            const roomName: string = rooms[Math.floor(Math.random() * rooms.length)].name;
            // join room
            this.socketService.socket.emit('joinRoom', { roomName, playerId: this.socketService.socket.id });
        } else {
            alert("Il n'y a pas de salle disponible.");
        }
    }
}
