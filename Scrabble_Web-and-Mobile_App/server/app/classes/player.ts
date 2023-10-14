import * as GlobalConstants from '@app/classes/global-constants';
import { ChatMessage } from './chat-message';
import { PowerCard } from './power-card';
import { Tile } from './tile';

export class Player {
    id: string;
    name: string;
    elo: number;
    eloDisparity: number;
    stand: Tile[];

    isCreatorOfGame: boolean;

    // we are obliged to put the esLint disable because the object class we use isnt stable
    // we therefore need to use any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapLetterOnStand: Map<string, any>;
    score: number;
    nbLetterStand: number;

    // CHAT SERVICE DATA
    lastWordPlaced: string;
    chatHistory: ChatMessage[];
    debugOn: boolean;
    passInARow: number;

    // MOUSE EVENT SERVICE DATA
    tileIndexManipulation: number;

    // OBJECTIVE SERVICE DATA
    turn: number;
    allLetterSwapped: boolean;
    isMoveBingo: boolean;

    // POWERS
    powerCards: PowerCard[];
    nbValidWordPlaced: number;

    avatarUri: string;

    constructor(namePlayer: string, isCreatorOfGame: boolean, elo?: number) {
        this.name = namePlayer;
        this.isCreatorOfGame = isCreatorOfGame;
        this.id = '';
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
        this.powerCards = [];
        this.nbValidWordPlaced = 0;
        this.avatarUri = '';
        if (elo === undefined) {
            const startingElo = 2000;
            this.elo = startingElo;
        } else {
            this.elo = elo;
        }
    }
}
