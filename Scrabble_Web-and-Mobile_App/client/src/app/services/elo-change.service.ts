import { Injectable } from '@angular/core';
import { Player } from '@app/classes/player';

@Injectable({
    providedIn: 'root',
})
export class EloChangeService {
    changeEloOfPlayers(oldPlayers: Player[]): Player[] {
        const baseEloChangeForFirstOrLast = 20;
        const baseEloChangeForSecondOrThird = 10;
        const eloDisparityFactor = 20;
        const newPlayers: Player[] = [];
        oldPlayers.forEach((val) => newPlayers.push(Object.assign({}, val)));
        const averageElo = this.calculateAverageElo(oldPlayers);
        newPlayers[0].elo += Math.round(baseEloChangeForFirstOrLast + (averageElo - oldPlayers[0].elo) / eloDisparityFactor);
        newPlayers[1].elo += Math.round(baseEloChangeForSecondOrThird + (averageElo - oldPlayers[1].elo) / eloDisparityFactor);
        newPlayers[2].elo -= Math.round(baseEloChangeForSecondOrThird + (averageElo - oldPlayers[2].elo) / eloDisparityFactor);
        newPlayers[3].elo -= Math.round(baseEloChangeForFirstOrLast + (averageElo - oldPlayers[3].elo) / eloDisparityFactor);
        return newPlayers;
    }
    private calculateAverageElo(players: Player[]): number {
        let averageElo = 0;
        for (const player of players) {
            averageElo += player.elo;
        }
        return Math.floor(averageElo / players.length);
    }
}
