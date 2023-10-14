import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import * as io from 'socket.io';
import { Service } from 'typedi';

@Service()
export class EndGameService {
    sio: io.Server;
    constructor() {
        this.sio = new io.Server();
    }

    // returns the player who won the game
    chooseWinner(game: GameServer, players: Player[]): Player[] {
        if (players.length <= 0) {
            return [];
        }
        let bestScore = -100;
        game.winners = [];
        for (const player of players) {
            // subtract the score of the letters still on the stand
            // storing the id of the player with the highest score
            if (player.score > bestScore) {
                // emptying the array
                game.winners = [];
                game.winners.push(player);
                bestScore = player.score;
            } else if (player.score === bestScore) {
                game.winners.push(player);
            }
        }
        return game.winners;
    }
    listLetterStillOnStand(player: Player): string[] {
        const listLetterStillOnStand: string[] = new Array<string>();
        for (const tile of player.stand) {
            if (tile.letter.value !== '') {
                listLetterStillOnStand.push(tile.letter.value);
            }
        }
        return listLetterStillOnStand;
    }
}
