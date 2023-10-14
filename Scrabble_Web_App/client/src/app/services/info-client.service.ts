import { Injectable } from '@angular/core';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
import { RoomData } from '@app/classes/room-data';

@Injectable({
    providedIn: 'root',
})
export class InfoClientService {
    game: GameServer;
    player: Player;

    actualRoom: string;
    gameMode: string;
    isLog2990Enabled: boolean;

    // Some opponent info that we need for the html
    nameOpponent: string;
    nbLetterStandOpponent: number;
    scoreOpponent: number;

    // Game parameters
    minutesByTurn: number;
    randomBonusesOn: boolean;
    playerName: string;

    // The string displayed in the info pannel
    nameVP1dictionary0: number;
    dictionaries: MockDict[];
    nameVPBeginner: NameVP[];
    nameVPExpert: NameVP[];

    displayTurn: string;

    rooms: RoomData[];

    letterBank: Map<string, LetterData>;

    vpLevel: string;

    constructor() {
        this.actualRoom = '';
        this.gameMode = GlobalConstants.MODE_MULTI;
        this.isLog2990Enabled = true;
        this.nameOpponent = 'NomAdversaire';
        this.nbLetterStandOpponent = GlobalConstants.NUMBER_SLOT_STAND;
        this.scoreOpponent = 0;
        this.minutesByTurn = 1;
        this.randomBonusesOn = false;
        this.playerName = 'DefaultPlayerName';
        this.displayTurn = "En attente d'un autre joueur...";
        this.game = new GameServer(0, false, GlobalConstants.MODE_SOLO, false);
        this.player = new Player('DefaultPlayerObject');
        this.rooms = [];
        this.nameVP1dictionary0 = 0;
        this.vpLevel = 'debutant';

        this.letterBank = new Map([
            ['A', { quantity: 9, weight: 1 }],
            ['B', { quantity: 2, weight: 3 }],
            ['C', { quantity: 2, weight: 3 }],
            ['D', { quantity: 3, weight: 2 }],
            ['E', { quantity: 15, weight: 1 }],
            ['F', { quantity: 2, weight: 4 }],
            ['G', { quantity: 2, weight: 2 }],
            ['H', { quantity: 2, weight: 4 }],
            ['I', { quantity: 8, weight: 1 }],
            ['J', { quantity: 1, weight: 8 }],
            ['K', { quantity: 1, weight: 10 }],
            ['L', { quantity: 5, weight: 1 }],
            ['M', { quantity: 3, weight: 2 }],
            ['N', { quantity: 6, weight: 1 }],
            ['O', { quantity: 6, weight: 1 }],
            ['P', { quantity: 2, weight: 3 }],
            ['Q', { quantity: 1, weight: 8 }],
            ['R', { quantity: 6, weight: 1 }],
            ['S', { quantity: 6, weight: 1 }],
            ['T', { quantity: 6, weight: 1 }],
            ['U', { quantity: 6, weight: 1 }],
            ['V', { quantity: 2, weight: 4 }],
            ['W', { quantity: 1, weight: 10 }],
            ['X', { quantity: 1, weight: 10 }],
            ['Y', { quantity: 1, weight: 10 }],
            ['Z', { quantity: 1, weight: 10 }],
            ['*', { quantity: 2, weight: 0 }],
        ]);
        // If gameMode === 'Solo' alors we use the following functions for the VP
        this.nameVPBeginner = [];
        this.nameVPExpert = [];
        this.dictionaries = [];
    }

    generateNameOpponent(namePLayer: string): void {
        let randomNumber = this.giveRandomNbOpponent();

        if (this.vpLevel === 'debutant') {
            while (namePLayer === this.nameVPBeginner[randomNumber].firstName + this.nameVPBeginner[randomNumber].lastName) {
                if (randomNumber === this.nameVPBeginner.length - 1) {
                    randomNumber--;
                } else {
                    randomNumber++;
                }
            }
            this.nameOpponent = this.nameVPBeginner[randomNumber].firstName + this.nameVPBeginner[randomNumber].lastName;
        } else {
            while (namePLayer === this.nameVPExpert[randomNumber].firstName + this.nameVPExpert[randomNumber].lastName) {
                if (randomNumber === this.nameVPExpert.length - 1) {
                    randomNumber--;
                } else {
                    randomNumber++;
                }
            }
            this.nameOpponent = this.nameVPExpert[randomNumber].firstName + this.nameVPExpert[randomNumber].lastName;
        }
    }

    private giveRandomNbOpponent(): number {
        const returnValue = Math.floor(Math.random() * this.nameVPBeginner.length);
        return returnValue;
    }
}
