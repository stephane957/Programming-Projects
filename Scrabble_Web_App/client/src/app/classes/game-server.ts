// magic number error are linked to the attribution of points for the objectives
// its useless to create new variables therefore we use the following line
/* eslint-disable @typescript-eslint/no-magic-numbers*/
import * as GlobalConstants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Objective } from './objective';
import { Player } from './player';
import { Tile } from './tile';

export class GameServer {
    // LETTER BANK SERVICE DATA
    letterBank: Map<string, LetterData>;
    letters: string[];

    // BOARD SERVICE DATA
    board: Tile[][];
    // we are obliged to put the esLint disable because the object class we use isnt stable
    // we therefore need to use any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapLetterOnBoard: Map<string, any>;

    bonusBoard: string[][];
    bonuses: string[];

    // EQUIVALENT STAND PLAYER SERVICE DATA
    mapPlayers: Map<string, Player>;

    // GAME PARAMETERS SERVICE DATA
    randomBonusesOn: boolean;
    gameMode: string;
    isLog2990Enabled: boolean;
    minutesByTurn: number;

    // PLAY AREA SERVICE DATA
    nbLetterReserve: number;
    gameStarted: boolean;
    gameFinished: boolean;
    masterTimer: string;
    objectiveArray: Objective[];
    objectivesOfGame: Objective[];

    // SKIP TURN SERVICE DATA
    displaySkipTurn: string;
    currentPlayerId: string;

    constructor(minutesByTurn: number, randomBonusesOn: boolean, gameMode: string, isLog2990Enabled: boolean) {
        // Set the basic attributes from the constructor parameters
        this.minutesByTurn = minutesByTurn;
        this.randomBonusesOn = randomBonusesOn;
        this.gameMode = gameMode;
        this.isLog2990Enabled = isLog2990Enabled;

        // Initializing the rest of the variables
        this.letters = [];
        this.board = [];
        this.mapLetterOnBoard = new Map();
        this.mapPlayers = new Map();
        this.nbLetterReserve = GlobalConstants.DEFAULT_NB_LETTER_BANK;
        this.gameStarted = false;
        this.gameFinished = false;
        this.masterTimer = '';
        this.displaySkipTurn = "En attente d'un autre joueur..";
        this.currentPlayerId = '';

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

        // initializing of the gameServer array
        this.initializeLettersArray();
        this.initializeBonusBoard();

        this.objectiveArray = [];
        this.objectivesOfGame = [];
        if (isLog2990Enabled) {
            this.initializeObjectiveArray();
            this.objectivesOfGame.push(
                this.returnRandomObjectiveNotUsed('public'),
                this.returnRandomObjectiveNotUsed('public'),
                this.returnRandomObjectiveNotUsed(''),
                this.returnRandomObjectiveNotUsed(''),
            );
            // this.objectivesOfGame.push(this.returnRandomObjectiveNotUsed('public'));
            // this.objectivesOfGame.push(this.returnRandomObjectiveNotUsed(''));
            // this.objectivesOfGame.push(this.returnRandomObjectiveNotUsed(''));
        }
    }

    setObjectivePlayer(idPlayer: string) {
        const objectivesNotTaken = this.objectivesOfGame.filter((objective) => objective.playerId === '');
        objectivesNotTaken[0].playerId = idPlayer;
    }

    private setMockTiles() {
        this.bonusBoard = [
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx'],
            ['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx'],
            ['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx'],
            ['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx'],
            ['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx'],
            ['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx'],
            ['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
        ];
    }

    private initializeBonusBoard(): void {
        this.setMockTiles();
        if (this.randomBonusesOn) {
            const nbOfWordx3 = 8;
            const nbOfWordx2 = 17;
            const nbOfLetterx3 = 12;
            const nbOfLetterx2 = 24;

            // const arrayBonuses = ['wordx3', 'wordx2', 'letterx3', 'letterx2'];
            const mapBonuses: Map<string, number> = new Map();
            mapBonuses.set('wordx3', nbOfWordx3);
            mapBonuses.set('wordx2', nbOfWordx2);
            mapBonuses.set('letterx3', nbOfLetterx3);
            mapBonuses.set('letterx2', nbOfLetterx2);

            const columns = 15;
            const rows = 15;

            this.initializeBonusesArray(mapBonuses);

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    if (this.bonusBoard[i][j] !== 'xx') {
                        let clear = false;
                        while (!clear) {
                            const randomNumber = this.generateRandomNumber();
                            const key = this.bonuses[randomNumber];
                            if (key && key !== undefined) {
                                this.bonusBoard[i][j] = key;
                                this.bonuses.splice(randomNumber, 1);
                                clear = true;
                            }
                        }
                    }
                }
            }
        }
    }

    private initializeBonusesArray(mapBonuses: Map<string, number>) {
        this.bonuses = new Array<string>();
        for (const key of mapBonuses.keys()) {
            const bonusNumber = mapBonuses.get(key);
            if (bonusNumber) {
                for (let i = 0; i < bonusNumber; i++) {
                    this.bonuses.push(key);
                }
            }
        }
    }

    private initializeLettersArray(): void {
        this.letters = new Array<string>();
        for (const key of this.letterBank.keys()) {
            const letterData = this.letterBank.get(key)?.quantity;
            if (letterData) {
                for (let i = 0; i < letterData; i++) {
                    this.letters.push(key);
                }
            }
        }
    }

    private generateRandomNumber() {
        const maxNumberGenerated = 61;
        return Math.floor(Math.random() * (maxNumberGenerated + 1)); // aléatoire entre 0 et 3
    }

    private initializeObjectiveArray(): void {
        this.objectiveArray.push(
            new Objective(10, 'Ne pas échanger ou passer pendant les trois premiers tours.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 0),
        );
        this.objectiveArray.push(
            new Objective(
                15,
                'Placer un mot avec au moins 3 fois la même lettre sans utiliser de lettre blanche.',
                GlobalConstants.UNCOMPLETED_OBJECTIVE,
                1,
            ),
        );
        this.objectiveArray.push(
            new Objective(20, "Placer consécutivement deux fois le même mot d'au moins 5 points.", GlobalConstants.UNCOMPLETED_OBJECTIVE, 2),
        );
        this.objectiveArray.push(
            new Objective(15, 'Placer un mot avec plus de voyelles que de consonnes.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 3),
        );
        this.objectiveArray.push(
            new Objective(10, 'Ne pas utiliser la lettre e ou a dans les 2 premiers tours.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 4),
        );
        this.objectiveArray.push(new Objective(25, 'Placer un mot qui crée au moins 3 mots.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 5));
        this.objectiveArray.push(new Objective(15, "Former un mot d'au moins 8 lettres.", GlobalConstants.UNCOMPLETED_OBJECTIVE, 6));
        this.objectiveArray.push(
            new Objective(20, 'Faire un bingo après avoir échangé toutes ses lettres.', GlobalConstants.UNCOMPLETED_OBJECTIVE, 7),
        );
    }

    private returnRandomObjectiveNotUsed(idPlayer: string): Objective {
        let objectiveToReturn: Objective = new Objective(0, '', 'notComplete', 0);
        const objectivePos: number = Math.floor(Math.random() * this.objectiveArray.length);
        objectiveToReturn = this.objectiveArray[objectivePos];
        this.objectiveArray.splice(objectivePos, 1);
        if (idPlayer === 'public') {
            objectiveToReturn.playerId = idPlayer;
        }
        return objectiveToReturn;
    }
}
