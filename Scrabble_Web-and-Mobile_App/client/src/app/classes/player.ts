import * as Constants from '@app/classes/global-constants';
import { ChatMessage } from './chat-message';
import { Letter } from './letter';
import { PowerCard } from './power-card';
import { Tile } from './tile';
import { Vec4 } from './vec4';

export class Player {
    elo: number;
    eloDisparity: number;
    id: string;
    name: string;
    stand: Tile[];
    avatarUri: string;
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

    // OBJECTIVE DATA
    turn: number;
    allLetterSwapped: boolean;
    isMoveBingo: boolean;

    // POWERS
    powerCards: PowerCard[];
    nbValidWordPlaced: number;

    constructor(namePlayer: string, isCreatorOfGame: boolean) {
        this.name = namePlayer;
        this.isCreatorOfGame = isCreatorOfGame;
        this.id = '';
        this.stand = [];
        this.avatarUri = '';
        this.mapLetterOnStand = new Map();
        this.score = 0;
        this.nbLetterStand = Constants.NUMBER_SLOT_STAND;
        this.lastWordPlaced = '';
        this.chatHistory = [];
        this.debugOn = false;
        this.passInARow = 0;
        this.turn = 1;
        this.tileIndexManipulation = Constants.DEFAULT_VALUE_NUMBER;
        this.allLetterSwapped = false;
        this.isMoveBingo = false;
        this.powerCards = [new PowerCard(Constants.JUMP_NEXT_ENNEMY_TURN, true), new PowerCard(Constants.REMOVE_POINTS_FROM_MAX, true)];
        this.nbValidWordPlaced = 0;

        // TODO remove this next line later
        this.chatHistory.push(new ChatMessage(this.name, 'Bienvenue sur le chat'));

        this.initStand();
    }

    initStand(): void {
        const letterInit = '*abcdef';
        const nbOccupiedSquare = 7;
        for (
            let i = 0, j = Constants.SIZE_OUTER_BORDER_STAND;
            i < Constants.NUMBER_SLOT_STAND;
            i++, j += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
        ) {
            const newPosition = new Vec4();
            const newTile = new Tile();
            const newLetter = new Letter();

            // Initialising the position
            newPosition.x1 = j + Constants.PADDING_BOARD_FOR_STANDS + Constants.DEFAULT_WIDTH_BOARD / 2 - Constants.DEFAULT_WIDTH_STAND / 2;
            newPosition.y1 =
                Constants.PADDING_BET_BOARD_AND_STAND +
                Constants.SIZE_OUTER_BORDER_STAND +
                Constants.PADDING_BOARD_FOR_STANDS +
                Constants.DEFAULT_WIDTH_BOARD;
            newPosition.width = Constants.WIDTH_EACH_SQUARE;
            newPosition.height = Constants.WIDTH_EACH_SQUARE;
            newTile.position = newPosition;

            // Fills the occupiedSquare
            if (i < nbOccupiedSquare) {
                newLetter.weight = 1;
                newLetter.value = letterInit[i];

                newTile.letter = newLetter;
                newTile.bonus = '0';

                this.stand.push(newTile);
            }
            // Fills the rest
            else {
                newLetter.weight = 0;
                newLetter.value = '';

                newTile.letter = newLetter;
                newTile.bonus = '0';

                this.stand.push(newTile);
            }
        }
    }
}
