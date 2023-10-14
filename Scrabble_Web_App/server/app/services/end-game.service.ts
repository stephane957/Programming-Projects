import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class EndGameService {
    constructor(private databaseService: DatabaseService) {}

    chooseWinner(game: GameServer, player: Player, opponent: Player): string {
        const scoreDeductedPlayer = this.countDeductedScore(player);
        const scoreDeductedOpponent = this.countDeductedScore(opponent);
        player.score -= scoreDeductedPlayer;
        opponent.score -= scoreDeductedOpponent;

        // Adds bonus points if the stand is empty
        if (this.isStandEmptyBonusPoints(player, game)) {
            player.score += scoreDeductedOpponent;
        }
        if (this.isStandEmptyBonusPoints(opponent, game)) {
            opponent.score += scoreDeductedPlayer;
        }
        if (game.isLog2990Enabled) {
            this.databaseService.addScoreLog2990ToDb(player);
            this.databaseService.addScoreLog2990ToDb(opponent);
        } else {
            this.databaseService.addScoreClassicToDb(player);
            this.databaseService.addScoreClassicToDb(opponent);
        }
        if (player.score > opponent.score) {
            return GlobalConstants.PLAYER_WIN;
        } else if (player.score < opponent.score) {
            return GlobalConstants.OPPONENT_WIN;
        } else {
            return GlobalConstants.NOBODY_WIN;
        }
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

    private countDeductedScore(player: Player): number {
        let scoreDeducted = 0;
        for (const tile of player.stand) {
            if (tile.letter.weight) {
                scoreDeducted += tile.letter.weight;
            }
        }
        return scoreDeducted;
    }

    private isStandEmptyBonusPoints(player: Player, game: GameServer): boolean {
        const conditionBonusPoints = player.nbLetterStand !== 0 || game.nbLetterReserve !== 0;
        return conditionBonusPoints ? false : true;
    }
}
