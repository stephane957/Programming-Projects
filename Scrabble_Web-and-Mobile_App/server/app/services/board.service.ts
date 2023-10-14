import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { Vec4 } from '@app/classes/vec4';
import { Service } from 'typedi';

@Service()
export class BoardService {
    initBoardArray(game: GameServer) {
        for (
            let i = 0,
                l =
                    Constants.SIZE_OUTER_BORDER_BOARD -
                    Constants.WIDTH_EACH_SQUARE -
                    Constants.WIDTH_LINE_BLOCKS +
                    Constants.PADDING_BOARD_FOR_STANDS;
            i < Constants.NUMBER_SQUARE_H_AND_W + 2;
            i++, l += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
        ) {
            game.board[i] = new Array<Tile>();
            for (
                let j = 0,
                    k =
                        Constants.SIZE_OUTER_BORDER_BOARD -
                        Constants.WIDTH_EACH_SQUARE -
                        Constants.WIDTH_LINE_BLOCKS +
                        Constants.PADDING_BOARD_FOR_STANDS;
                j < Constants.NUMBER_SQUARE_H_AND_W + 2;
                j++, k += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
            ) {
                const newTile = new Tile();
                const newPosition = new Vec4();
                const newLetter = new Letter();

                newPosition.x1 = k;
                newPosition.y1 = l;
                newPosition.width = Constants.WIDTH_EACH_SQUARE;
                newPosition.height = Constants.WIDTH_EACH_SQUARE;

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

    putLetterInBoardArray(tileToPut: Tile, position: Vec2, game: GameServer) {
        game.board[position.y][position.x].letter.value = tileToPut.letter.value;
        game.board[position.y][position.x].letter.weight = tileToPut.letter.weight;
    }

    // get all the indexes of the tmp tiles
    getIdxsTmpLetters(game: GameServer): Vec2[] {
        const idxsTmpLetters = [];
        for (let i = 0; i < game.board.length; i++) {
            for (let j = 0; j < game.board[i].length; j++) {
                // if the border is "#ffaaff" is means it's a tmp tile
                if (game.board[i][j].borderColor !== '#ffaaff') {
                    continue;
                }
                idxsTmpLetters.push({ x: i, y: j });
            }
        }
        return idxsTmpLetters;
    }

    rmTempTiles(game: GameServer): string {
        let letterNotUsed = '';
        const idxsTmpLetters = this.getIdxsTmpLetters(game);
        for (const idxsLetter of idxsTmpLetters) {
            letterNotUsed += game.board[idxsLetter.x][idxsLetter.y].letter.value;
            const emptyTile = new Tile();
            const newPosition = new Vec4();
            const newLetter = new Letter();
            newPosition.x1 = game.board[idxsLetter.x][idxsLetter.y].position.x1;
            newPosition.y1 = game.board[idxsLetter.x][idxsLetter.y].position.y1;
            newPosition.height = game.board[idxsLetter.x][idxsLetter.y].position.height;
            newPosition.width = game.board[idxsLetter.x][idxsLetter.y].position.width;

            newLetter.weight = 0;
            newLetter.value = '';

            emptyTile.bonus = game.bonusBoard[idxsLetter.x][idxsLetter.y];
            emptyTile.letter = newLetter;
            emptyTile.position = newPosition;

            game.board[idxsLetter.x][idxsLetter.y] = emptyTile;
        }
        return letterNotUsed;
    }
}
