import { Player } from '@app/classes/player';
import { Spectator } from '@app/classes/spectator';

export class GameSaved {
    roomName: string;
    players: string[];
    spectators: string[];
    winners: string[];
    scores: number[];
    numberOfTurns: number;
    gameStartDate: string;
    playingTime: string;
    nbLetterReserve: number;
    mapLettersOnStand: Map<string, string>;
    _id?: string;

    constructor(
        players: Player[],
        roomName: string,
        numberOfTurns: number,
        gameStartDate: string,
        playingTime: string,
        nbLetterReserve: number,
        spectators?: Spectator[],
        winners?: Player[],
    ) {
        this.roomName = roomName;
        this.numberOfTurns = numberOfTurns;
        this.playingTime = playingTime;
        this.nbLetterReserve = nbLetterReserve;
        this.gameStartDate = gameStartDate;
        this.mapLettersOnStand = new Map<string, string>();
        this.players = [];
        this.spectators = [];
        this.winners = [];
        this.scores = [];

        this.populateArrays(players, spectators, winners);
        this.populateMap(players);
    }

    populateArrays(players: Player[], spectators: Spectator[] | undefined, winners: Player[] | undefined) {
        for (let index = 0; index < players.length; index++) {
            this.players[index] = players[index].name;
        }
        const quatre = 4;
        for (let index = 0; index < quatre; index++) {
            this.scores[index] = players[index].score;
        }
        if (spectators) {
            for (let index = 0; index < spectators.length; index++) {
                this.spectators[index] = spectators[index].name;
            }
        }

        if (winners) {
            for (let index = 0; index < winners.length; index++) {
                this.winners[index] = winners[index].name;
            }
        }
    }

    populateMap(players: Player[]) {
        for (const player of players) {
            this.mapLettersOnStand.set(player.name, this.lettersOnStand(player));
        }
    }

    lettersOnStand(player: Player): string {
        const listLetterStillOnStand: string[] = new Array<string>();
        for (const tile of player.stand) {
            if (tile.letter.value !== '') {
                listLetterStillOnStand.push(tile.letter.value);
            }
        }
        return listLetterStillOnStand.toString();
    }
}
