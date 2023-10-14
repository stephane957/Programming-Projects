import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { Tile } from '@app/classes/tile';
import { Vec4 } from '@app/classes/vec4';
import { Service } from 'typedi';

@Service()
export class BoardService {
    initBoardArray(game: GameServer) {
        for (
            let i = 0, l = GlobalConstants.SIZE_OUTER_BORDER_BOARD - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS;
            i < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2;
            i++, l += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS
        ) {
            game.board[i] = new Array<Tile>();
            for (
                let j = 0, k = GlobalConstants.SIZE_OUTER_BORDER_BOARD - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS;
                j < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2;
                j++, k += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS
            ) {
                const newTile = new Tile();
                const newPosition = new Vec4();
                const newLetter = new Letter();

                newPosition.x1 = k;
                newPosition.y1 = l;
                newPosition.width = GlobalConstants.WIDTH_EACH_SQUARE;
                newPosition.height = GlobalConstants.WIDTH_EACH_SQUARE;

                newLetter.weight = 0;
                newLetter.value = '';

                newTile.letter = newLetter;
                newTile.position = newPosition;
                newTile.bonus = game.bonusBoard[i][j];

                game.board[i].push(newTile);
            }
        }
    }

    deleteLetterInBoardMap(letterToRemove: string, game: GameServer) {
        if (!game.mapLetterOnBoard.has(letterToRemove)) {
            return;
        }

        if (game.mapLetterOnBoard.get(letterToRemove).value === 1) {
            game.mapLetterOnBoard.delete(letterToRemove);
        } else {
            game.mapLetterOnBoard.get(letterToRemove).value--;
        }
    }

    writeLetterInGameMap(letterToPut: string, game: GameServer) {
        if (letterToPut === '') {
            return;
        }
        if (!game.mapLetterOnBoard.has(letterToPut)) {
            game.mapLetterOnBoard.set(letterToPut, { value: 1 });
        } else {
            game.mapLetterOnBoard.get(letterToPut).value++;
        }
    }
}
