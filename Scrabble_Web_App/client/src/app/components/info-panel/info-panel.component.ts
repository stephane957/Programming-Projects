import { Component } from '@angular/core';
import * as GlobalConstants from '@app/classes/global-constants';
import { Objective } from '@app/classes/objective';
import { DrawingService } from '@app/services/drawing.service';
import { InfoClientService } from '@app/services/info-client.service';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-info-panel',
    templateUrl: './info-panel.component.html',
    styleUrls: ['./info-panel.component.scss'],
})
export class InfoPanelComponent {
    enter: string = 'Enter';

    constructor(
        public drawingService: DrawingService,
        public socketService: SocketService,
        public placeGraphicService: PlaceGraphicService,
        public infoClientService: InfoClientService,
    ) {}

    onExchangeClick() {
        this.socketService.socket.emit('onExchangeClick');
    }
    onCancelClick() {
        this.socketService.socket.emit('onAnnulerClick');
    }

    skipTurnButton() {
        this.socketService.socket.emit('turnFinished');
    }

    objectiveClass(objective: Objective) {
        if (objective.playerId === 'public' && objective.failedFor.indexOf(this.socketService.socket.id) > GlobalConstants.DEFAULT_VALUE_NUMBER) {
            return 'objective failed';
        }
        if (objective.objectiveStatus === GlobalConstants.COMPLETED_OBJECTIVE) {
            if (objective.playerId === 'public' && objective.completedBy !== this.socketService.socket.id) {
                return 'objective failed';
            }
            return 'objective completed';
        }
        if (objective.objectiveStatus === GlobalConstants.FAILED_OBJECTIVE) {
            return 'objective failed';
        }
        return 'objective uncompleted';
    }
}
