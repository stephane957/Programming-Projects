import * as GlobalConstants from '@app/classes/global-constants';
import { Command } from './command';
import { Tile } from './tile';

export class Player {
    idOpponent: string;
    idPlayer: string;
    name: string;
    stand: Tile[];

    // we are obliged to put the esLint disable because the object class we use isnt stable
    // we therefore need to use any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapLetterOnStand: Map<string, any>;
    score: number;
    nbLetterStand: number;

    // CHAT SERVICE DATA
    lastWordPlaced: string;
    chatHistory: Command[];
    debugOn: boolean;
    passInARow: number;

    // MOUSE EVENT SERVICE DATA
    tileIndexManipulation: number;

    // OBJECTIVE DATA
    turn: number;
    allLetterSwapped: boolean;
    isMoveBingo: boolean;

    constructor(namePlayer: string) {
        this.name = namePlayer;
        this.idOpponent = '';
        this.idPlayer = '';
        this.stand = [];
        this.mapLetterOnStand = new Map();
        this.score = 0;
        this.nbLetterStand = GlobalConstants.NUMBER_SLOT_STAND;
        this.lastWordPlaced = '';
        this.chatHistory = [];
        this.debugOn = false;
        this.passInARow = 0;
        this.turn = 1;
        this.tileIndexManipulation = GlobalConstants.DEFAULT_VALUE_NUMBER;
        this.allLetterSwapped = false;
        this.isMoveBingo = false;
    }
}
