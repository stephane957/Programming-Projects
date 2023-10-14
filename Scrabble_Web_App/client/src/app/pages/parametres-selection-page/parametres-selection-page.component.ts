import { Component, OnInit } from '@angular/core';
import * as GlobalConstants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';

interface TimeIntervals {
    value: number;
    viewValue: string;
}

@Component({
    selector: 'app-solo-init-page',
    templateUrl: './parametres-selection-page.component.html',
    styleUrls: ['./parametres-selection-page.component.scss'],
})
export class ParametresSelectionPageComponent implements OnInit {
    timeIntervals: TimeIntervals[];
    vpLevels: string[];
    mockDictionary: MockDict;

    constructor(private socketService: SocketService, public infoClientService: InfoClientService) {}

    ngOnInit() {
        this.timeIntervals = [
            { value: 0.5, viewValue: '30 sec' },
            { value: 1, viewValue: '1 min' },
            { value: 1.5, viewValue: '1min 30sec' },
            { value: 2, viewValue: '2 min' },
            { value: 2.5, viewValue: '2min 30sec' },
            { value: 3, viewValue: '3 min' },
            { value: 3.5, viewValue: '3min 30sec' },
            { value: 4, viewValue: '4 min' },
            { value: 4.5, viewValue: '4min 30sec' },
            { value: 5, viewValue: '5 min' },
        ];
        this.vpLevels = ['debutant', 'expert'];
        this.mockDictionary = {
            title: 'Dictionnaire français par défaut',
            description: 'Ce dictionnaire contient environ trente mille mots français',
        };
    }

    onClickTime(interval: string) {
        this.timeSelection(interval);
    }

    onClickDict(dictionary: MockDict) {
        this.mockDictionary = dictionary;
    }

    vpLevelSelection(level: string) {
        this.infoClientService.vpLevel = level;
    }

    randomizeBonuses() {
        this.infoClientService.randomBonusesOn = !this.infoClientService.randomBonusesOn;
    }

    createRoom() {
        let roomName = '';
        if (this.infoClientService.gameMode === GlobalConstants.MODE_MULTI) {
            const inputElement = document.getElementById('roomName') as HTMLInputElement;
            roomName = inputElement.value;
            this.socketService.socket.emit('createRoomAndGame', {
                roomName,
                playerName: this.infoClientService.playerName,
                timeTurn: this.infoClientService.minutesByTurn,
                isBonusRandom: this.infoClientService.randomBonusesOn,
                gameMode: this.infoClientService.gameMode,
                isLog2990Enabled: this.infoClientService.isLog2990Enabled,
                nameOpponent: '',
                vpLevel: '',
            });
        } else {
            roomName = 'roomOf' + this.socketService.socket.id.toString();
            this.socketService.socket.emit('createRoomAndGame', {
                roomName,
                playerName: this.infoClientService.playerName,
                timeTurn: this.infoClientService.minutesByTurn,
                isBonusRandom: this.infoClientService.randomBonusesOn,
                gameMode: this.infoClientService.gameMode,
                isLog2990Enabled: this.infoClientService.isLog2990Enabled,
                nameOpponent: this.infoClientService.nameOpponent,
                vpLevel: this.infoClientService.vpLevel,
            });
        }
        this.infoClientService.actualRoom = roomName;
        this.socketService.socket.emit('dictionarySelected', this.mockDictionary);
        this.infoClientService.generateNameOpponent(this.infoClientService.playerName);
    }

    private timeSelection(interval: string) {
        switch (interval) {
            case '30 sec':
                this.infoClientService.minutesByTurn = 0.5;
                break;
            case '1 min':
                this.infoClientService.minutesByTurn = 1;
                break;
            case '1min 30sec':
                this.infoClientService.minutesByTurn = 1.5;
                break;
            case '2 min':
                this.infoClientService.minutesByTurn = 2;
                break;
            case '2min 30sec':
                this.infoClientService.minutesByTurn = 2.5;
                break;
            case '3 min':
                this.infoClientService.minutesByTurn = 3;
                break;
            case '3min 30sec':
                this.infoClientService.minutesByTurn = 3.5;
                break;
            case '4 min':
                this.infoClientService.minutesByTurn = 4;
                break;
            case '4min 30sec':
                this.infoClientService.minutesByTurn = 4.5;
                break;
            case '5 min':
                this.infoClientService.minutesByTurn = 5;
                break;
        }
    }
}
