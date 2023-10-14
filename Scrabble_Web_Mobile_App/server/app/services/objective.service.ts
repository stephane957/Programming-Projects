import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { Service } from 'typedi';
import { BoardExplorerService } from './board-explorer.service';

const firstObjective = 0;
const secondObjective = 1;
const thirdObjective = 2;
const fourthObjective = 3;
const fifthObjective = 4;
const sixthObjective = 5;
const seventhObjective = 6;
const eighthObjective = 7;

@Service()
export class ObjectiveService {
    constructor(private boardExplorerService: BoardExplorerService) {}

    isPlayerObjectivesCompleted(game: GameServer, player: Player, command: string) {
        const dataSeparated = command.split(' ');

        // we have to normalize the word necessary
        if (dataSeparated[2]) {
            dataSeparated[2] = dataSeparated[2].normalize('NFD').replace(/\p{Diacritic}/gu, '');
        }

        for (const objective of game.objectivesOfGame) {
            if (objective.objectiveStatus !== GlobalConstants.UNCOMPLETED_OBJECTIVE) {
                continue;
            }
            switch (objective.objectiveId) {
                case firstObjective:
                    if (dataSeparated[0]) {
                        this.checkIfObjective0Completed(game, player, dataSeparated[0]);
                    }
                    break;
                case secondObjective:
                    if (dataSeparated[2]) {
                        this.checkIfObjective1Completed(game, player, dataSeparated[2]);
                    }
                    break;
                case thirdObjective:
                    if (dataSeparated[2]) {
                        this.checkIfObjective2Completed(game, player, dataSeparated[2]);
                    }
                    break;
                case fourthObjective:
                    if (dataSeparated[2]) {
                        this.checkIfObjective3Completed(game, player, dataSeparated[2]);
                    }
                    break;
                case fifthObjective:
                    this.checkIfObjective4Completed(game, player, dataSeparated);
                    break;
                case sixthObjective:
                    if (dataSeparated[1] && dataSeparated[0] === '!placer') {
                        this.checkIfObjective5Completed(game, player, dataSeparated[1]);
                    }
                    break;
                case seventhObjective:
                    if (dataSeparated[2]) {
                        this.checkIfObjective6Completed(game, player, dataSeparated[2]);
                    }
                    break;
                case eighthObjective:
                    if (dataSeparated[2]) {
                        this.checkIfObjective7Completed(game, player);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    private checkIfObjective0Completed(game: GameServer, player: Player, command: string) {
        const indexArrClassObjective = 0;
        const objectiveIndexGame: number = game.objectivesOfGame.findIndex((element) => element.objectiveId === indexArrClassObjective);

        const objectiveInQuestion = game.objectivesOfGame[objectiveIndexGame];
        const isNotPlayerObjectives: boolean = objectiveInQuestion.playerId !== 'public' && objectiveInQuestion.playerId !== player.idPlayer;
        const outOfBounds = -1;
        if (isNotPlayerObjectives || objectiveInQuestion.failedFor.indexOf(player.idPlayer) > outOfBounds) {
            return;
        }
        const threeFirstLettersCommand = command.slice(0, 3);
        if (player.turn <= 3) {
            if (threeFirstLettersCommand === '!pa' || threeFirstLettersCommand === '!éc') {
                if (objectiveInQuestion.playerId === 'public') {
                    objectiveInQuestion.failedFor.push(player.idPlayer);
                    if (objectiveInQuestion.failedFor.length >= 2) {
                        objectiveInQuestion.objectiveStatus = GlobalConstants.FAILED_OBJECTIVE;
                    }
                } else {
                    objectiveInQuestion.objectiveStatus = GlobalConstants.FAILED_OBJECTIVE;
                }
            }
        } else {
            player.score += objectiveInQuestion.points;
            if (objectiveInQuestion.playerId === 'public') {
                objectiveInQuestion.completedBy = player.idPlayer;
            }
            objectiveInQuestion.objectiveStatus = GlobalConstants.COMPLETED_OBJECTIVE;
        }
    }

    private checkIfObjective1Completed(game: GameServer, player: Player, wordPlaced: string) {
        const indexArrClassObjective = 1;
        const objectiveIndexGame: number = game.objectivesOfGame.findIndex((element) => element.objectiveId === indexArrClassObjective);

        const objectiveInQuestion = game.objectivesOfGame[objectiveIndexGame];
        const isNotPlayerObjectives: boolean = objectiveInQuestion.playerId !== 'public' && objectiveInQuestion.playerId !== player.idPlayer;
        if (isNotPlayerObjectives) {
            return;
        }
        for (const letter of wordPlaced) {
            const charToSearch = letter;
            // we verify if the letter is not a white tile
            if (charToSearch !== charToSearch.toLowerCase()) {
                continue;
            }
            if (wordPlaced.split(charToSearch).length - 1 >= 3) {
                player.score += objectiveInQuestion.points;
                if (objectiveInQuestion.playerId === 'public') {
                    objectiveInQuestion.completedBy = player.idPlayer;
                }
                objectiveInQuestion.objectiveStatus = GlobalConstants.COMPLETED_OBJECTIVE;
                break;
            }
        }
    }

    private checkIfObjective2Completed(game: GameServer, player: Player, wordPlaced: string) {
        const indexArrClassObjective = 2;
        const objectiveIndexGame: number = game.objectivesOfGame.findIndex((element) => element.objectiveId === indexArrClassObjective);

        const objectiveInQuestion = game.objectivesOfGame[objectiveIndexGame];
        const isNotPlayerObjectives: boolean = objectiveInQuestion.playerId !== 'public' && objectiveInQuestion.playerId !== player.idPlayer;
        if (isNotPlayerObjectives) {
            return;
        }
        if (player.lastWordPlaced === wordPlaced) {
            player.score += objectiveInQuestion.points;
            if (objectiveInQuestion.playerId === 'public') {
                objectiveInQuestion.completedBy = player.idPlayer;
            }
            objectiveInQuestion.objectiveStatus = GlobalConstants.COMPLETED_OBJECTIVE;
        }
    }

    private checkIfObjective3Completed(game: GameServer, player: Player, wordPlaced: string) {
        const indexArrClassObjective = 3;
        const objectiveIndexGame: number = game.objectivesOfGame.findIndex((element) => element.objectiveId === indexArrClassObjective);

        const objectiveInQuestion = game.objectivesOfGame[objectiveIndexGame];
        const isNotPlayerObjectives: boolean = objectiveInQuestion.playerId !== 'public' && objectiveInQuestion.playerId !== player.idPlayer;
        if (isNotPlayerObjectives) {
            return;
        }
        const vowels = wordPlaced.match(/[aeiouy]/gi);
        const nbVowels: number = vowels === null ? 0 : vowels.length;

        if (nbVowels > wordPlaced.length - nbVowels) {
            player.score += objectiveInQuestion.points;
            if (objectiveInQuestion.playerId === 'public') {
                objectiveInQuestion.completedBy = player.idPlayer;
            }
            objectiveInQuestion.objectiveStatus = GlobalConstants.COMPLETED_OBJECTIVE;
        }
    }

    private checkIfObjective4Completed(game: GameServer, player: Player, dataSeparated: string[]) {
        const indexArrClassObjective = 4;
        const objectiveIndexGame: number = game.objectivesOfGame.findIndex((element) => element.objectiveId === indexArrClassObjective);

        const objectiveInQuestion = game.objectivesOfGame[objectiveIndexGame];
        const isNotPlayerObjectives: boolean = objectiveInQuestion.playerId !== 'public' && objectiveInQuestion.playerId !== player.idPlayer;
        const outOfBounds = -1;
        if (isNotPlayerObjectives || objectiveInQuestion.failedFor.indexOf(player.idPlayer) > outOfBounds) {
            return;
        }

        let wordExchangedOrPlaced = '';
        if (dataSeparated[0] === '!placer') {
            wordExchangedOrPlaced = dataSeparated[2];
        } else if (dataSeparated[0] === '!échanger') {
            wordExchangedOrPlaced = dataSeparated[1];
        }

        if (player.turn <= 2) {
            if (wordExchangedOrPlaced.includes('a') || wordExchangedOrPlaced.includes('e')) {
                if (objectiveInQuestion.playerId === 'public') {
                    objectiveInQuestion.failedFor.push(player.idPlayer);
                    if (objectiveInQuestion.failedFor.length >= 2) {
                        objectiveInQuestion.objectiveStatus = GlobalConstants.FAILED_OBJECTIVE;
                    }
                } else {
                    objectiveInQuestion.objectiveStatus = GlobalConstants.FAILED_OBJECTIVE;
                }
            }
        } else {
            player.score += objectiveInQuestion.points;
            if (objectiveInQuestion.playerId === 'public') {
                objectiveInQuestion.completedBy = player.idPlayer;
            }
            objectiveInQuestion.objectiveStatus = GlobalConstants.COMPLETED_OBJECTIVE;
        }
    }

    private checkIfObjective5Completed(game: GameServer, player: Player, position: string) {
        const indexArrClassObjective = 5;
        const objectiveIndexGame: number = game.objectivesOfGame.findIndex((element) => element.objectiveId === indexArrClassObjective);

        const objectiveInQuestion = game.objectivesOfGame[objectiveIndexGame];
        const isNotPlayerObjectives: boolean = objectiveInQuestion.playerId !== 'public' && objectiveInQuestion.playerId !== player.idPlayer;
        if (isNotPlayerObjectives) {
            return;
        }
        const nbWordCreated = this.boardExplorerService.getWordArray(position, game.board).length;
        const nbWordToObjective = 3;
        if (nbWordCreated >= nbWordToObjective) {
            player.score += objectiveInQuestion.points;
            if (objectiveInQuestion.playerId === 'public') {
                objectiveInQuestion.completedBy = player.idPlayer;
            }
            objectiveInQuestion.objectiveStatus = GlobalConstants.COMPLETED_OBJECTIVE;
        }
    }

    private checkIfObjective6Completed(game: GameServer, player: Player, wordPlaced: string) {
        const indexArrClassObjective = 6;
        const wordLengthForObjective = 8;
        const objectiveIndexGame: number = game.objectivesOfGame.findIndex((element) => element.objectiveId === indexArrClassObjective);

        const objectiveInQuestion = game.objectivesOfGame[objectiveIndexGame];
        const isNotPlayerObjectives: boolean = objectiveInQuestion.playerId !== 'public' && objectiveInQuestion.playerId !== player.idPlayer;
        if (isNotPlayerObjectives) {
            return;
        }
        if (wordPlaced.length >= wordLengthForObjective) {
            player.score += objectiveInQuestion.points;
            if (objectiveInQuestion.playerId === 'public') {
                objectiveInQuestion.completedBy = player.idPlayer;
            }
            objectiveInQuestion.objectiveStatus = GlobalConstants.COMPLETED_OBJECTIVE;
        }
    }

    private checkIfObjective7Completed(game: GameServer, player: Player) {
        const indexArrClassObjective = 7;
        const objectiveIndexGame: number = game.objectivesOfGame.findIndex((element) => element.objectiveId === indexArrClassObjective);

        const objectiveInQuestion = game.objectivesOfGame[objectiveIndexGame];
        const isNotPlayerObjectives: boolean = objectiveInQuestion.playerId !== 'public' && objectiveInQuestion.playerId !== player.idPlayer;
        if (isNotPlayerObjectives) {
            return;
        }

        if (player.allLetterSwapped && player.isMoveBingo) {
            player.score += objectiveInQuestion.points;
            if (objectiveInQuestion.playerId === 'public') {
                objectiveInQuestion.completedBy = player.idPlayer;
            }
            objectiveInQuestion.objectiveStatus = GlobalConstants.COMPLETED_OBJECTIVE;
            player.allLetterSwapped = false;
            player.isMoveBingo = false;
        }
    }
}
