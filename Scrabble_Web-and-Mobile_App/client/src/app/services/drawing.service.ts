/* eslint-disable max-lines*/
import { Injectable } from '@angular/core';
import * as Constants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { InfoClientService } from './info-client.service';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    playAreaCanvas: CanvasRenderingContext2D;
    tmpTileCanvas: CanvasRenderingContext2D;

    constructor(private infoClientService: InfoClientService) {}

    canvasInit(playAreaCanvas: CanvasRenderingContext2D, tmpTileCanvas: CanvasRenderingContext2D) {
        this.playAreaCanvas = playAreaCanvas;
        this.tmpTileCanvas = tmpTileCanvas;
    }

    reDrawStand(stand: Tile[], letterBank: Map<string, LetterData>) {
        this.initStand(true);
        for (let x = 0; x < Constants.NUMBER_SLOT_STAND; x++) {
            if (stand[x] !== undefined && stand[x].letter.value !== '') {
                this.drawOneLetter(stand[x].letter.value, stand[x], this.playAreaCanvas, letterBank);
            }
        }
    }

    resetColorTileStand(player: Player, letterBank: Map<string, LetterData>) {
        for (let x = 0; x < Constants.NUMBER_SLOT_STAND; x++) {
            if (player.stand[x] !== undefined && player.stand[x].letter.value !== '') {
                this.drawOneLetter(player.stand[x].letter.value, player.stand[x], this.playAreaCanvas, letterBank);
            }
        }
    }

    // used to draw a letter from
    drawOneLetter(letterToDraw: string, tile: Tile, canvas: CanvasRenderingContext2D, letterBank: Map<string, LetterData>) {
        const letterToDrawUpper = letterToDraw.toUpperCase();
        canvas.beginPath();
        canvas.fillStyle = tile.backgroundColor;
        canvas.strokeStyle = tile.backgroundColor;
        // draws background of tile
        canvas.fillRect(tile.position.x1, tile.position.y1, tile.position.width, tile.position.height);
        // the number are so the letter tiles are smaller than the tile of the board
        canvas.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
        canvas.strokeStyle = tile.borderColor;
        // draws border of tile
        this.roundRect(tile.position.x1, tile.position.y1, tile.position.width, tile.position.height, canvas);
        // the number are so the letter tiles are smaller than the tile of the board
        canvas.fillStyle = '#212121';
        const letterData = letterBank.get(letterToDraw.toUpperCase());
        let letterWeight = 0;
        if (letterData) {
            letterWeight = letterData.weight;
        }
        const spaceForLetter: Vec2 = { x: 12, y: 26 };
        const spaceForNumber: Vec2 = { x: 27, y: 29 };
        const actualFont = canvas.font;
        canvas.font = 'bold 17px Roboto';
        canvas.fillText(letterToDrawUpper, tile.position.x1 + spaceForLetter.x, tile.position.y1 + spaceForLetter.y);

        canvas.font = '10px Roboto';
        if (letterWeight) {
            canvas.fillText(letterWeight.toString(), tile.position.x1 + spaceForNumber.x, tile.position.y1 + spaceForNumber.y);
        } else {
            canvas.fillText('', tile.position.x1 + spaceForNumber.x, tile.position.y1 + spaceForNumber.y);
        }
        canvas.font = actualFont;
        canvas.stroke();
    }

    // function that draws a tile with a given position to the drap and drop canvas
    drawFromDrag(tileToDraw: Tile, posToDraw: Vec2) {
        if (!tileToDraw) {
            return;
        }
        // we center the take for appearances it is better like that
        const posToDrawCentered = { x: posToDraw.x - tileToDraw.position.width / 2, y: posToDraw.y - tileToDraw.position.height / 2 };
        const letterToDrawUpper = tileToDraw.letter.value.toUpperCase();
        this.tmpTileCanvas.beginPath();
        this.tmpTileCanvas.fillStyle = tileToDraw.backgroundColor;
        this.tmpTileCanvas.strokeStyle = tileToDraw.backgroundColor;
        // draws background of tile
        this.tmpTileCanvas.fillRect(posToDrawCentered.x, posToDrawCentered.y, tileToDraw.position.width, tileToDraw.position.height);
        this.tmpTileCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
        this.tmpTileCanvas.strokeStyle = '#ffaaff';
        // draws border of tile
        this.roundRect(posToDrawCentered.x, posToDrawCentered.y, tileToDraw.position.width, tileToDraw.position.height, this.tmpTileCanvas);
        // the number are so the letter tiles are smaller than the tile of the board
        this.tmpTileCanvas.fillStyle = '#212121';
        const spaceForLetter: Vec2 = { x: 12, y: 26 };
        const spaceForNumber: Vec2 = { x: 27, y: 29 };
        const actualFont = this.tmpTileCanvas.font;
        this.tmpTileCanvas.font = 'bold 17px Roboto';
        this.tmpTileCanvas.fillText(letterToDrawUpper, posToDrawCentered.x + spaceForLetter.x, posToDrawCentered.y + spaceForLetter.y);

        this.tmpTileCanvas.font = '10px Roboto';
        if (tileToDraw.letter.weight) {
            this.tmpTileCanvas.fillText(
                tileToDraw.letter.weight.toString(),
                posToDrawCentered.x + spaceForNumber.x,
                posToDrawCentered.y + spaceForNumber.y,
            );
        } else {
            this.tmpTileCanvas.fillText('', posToDrawCentered.x + spaceForNumber.x, posToDrawCentered.y + spaceForNumber.y);
        }
        this.tmpTileCanvas.font = actualFont;
        this.tmpTileCanvas.stroke();
    }

    removeTile(tile: Tile) {
        tile.isOnBoard = true;
        this.playAreaCanvas.beginPath();
        this.playAreaCanvas.fillStyle = '#BEB9A6';
        this.playAreaCanvas.fillRect(tile.position.x1, tile.position.y1, tile.position.width, tile.position.height);
        this.playAreaCanvas.stroke();
    }

    areLettersRightClicked(stand: Tile[]) {
        for (const tile of stand) {
            if (tile.backgroundColor === '#AEB1D9') {
                return true;
            }
        }
        return false;
    }

    // draws only the stand visual there is no logic
    initStand(isPlayerSpec: boolean) {
        const constPosXYForStands = Constants.PADDING_BOARD_FOR_STANDS + Constants.DEFAULT_WIDTH_BOARD / 2 - Constants.DEFAULT_WIDTH_STAND / 2;
        if (isPlayerSpec) {
            // top stand
            this.drawHorizStand(constPosXYForStands, 0);
            // left stand
            this.drawVertiStand(0, constPosXYForStands);
            // right stand
            this.drawVertiStand(
                Constants.PADDING_BOARD_FOR_STANDS + Constants.DEFAULT_WIDTH_BOARD + Constants.PADDING_BET_BOARD_AND_STAND,
                constPosXYForStands,
            );
        }
        // bottom stand
        this.drawHorizStand(
            constPosXYForStands,
            Constants.DEFAULT_WIDTH_BOARD + Constants.PADDING_BOARD_FOR_STANDS + Constants.PADDING_BET_BOARD_AND_STAND,
        );
    }

    // function that draws all the stands in the game with the logic
    // also it always put the stand of the player playing at the bottom
    // it is much easier to do it this so that the drag and drop coords are not messed up
    // in this function the order of the functions called are important don't change it !
    drawSpectatorStands(players: Player[]) {
        const paddingForStands = Constants.DEFAULT_HEIGHT_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        const constPosXYForStands = paddingForStands + Constants.DEFAULT_WIDTH_BOARD / 2 - Constants.DEFAULT_WIDTH_STAND / 2;

        let idxPlayerPlaying = this.infoClientService.game.idxPlayerPlaying;
        // bottom stand
        this.drawHorizStand(
            constPosXYForStands,
            Constants.DEFAULT_WIDTH_BOARD + paddingForStands + Constants.PADDING_BET_BOARD_AND_STAND,
            players[idxPlayerPlaying],
        );
        // we go to the next player
        idxPlayerPlaying = (idxPlayerPlaying + 1) % players.length;
        // left stand
        this.drawVertiStand(0, constPosXYForStands, players[idxPlayerPlaying]);

        // we go to the next player
        idxPlayerPlaying = (idxPlayerPlaying + 1) % players.length;
        // top stand
        this.drawHorizStand(constPosXYForStands, 0, players[idxPlayerPlaying]);

        // we go to the next player
        idxPlayerPlaying = (idxPlayerPlaying + 1) % players.length;
        // right stand
        this.drawVertiStand(
            paddingForStands + Constants.DEFAULT_WIDTH_BOARD + Constants.PADDING_BET_BOARD_AND_STAND,
            constPosXYForStands,
            players[idxPlayerPlaying],
        );
    }

    // the x and y are coords of the point in the top left corner of the stand
    drawHorizStand(x: number, y: number, player?: Player) {
        this.playAreaCanvas.font = '19px bold system-ui';
        this.playAreaCanvas.beginPath();
        // Fill the rectangle with an initial color
        this.playAreaCanvas.fillStyle = '#BEB9A6';
        this.playAreaCanvas.fillRect(x, y, Constants.DEFAULT_WIDTH_STAND, Constants.DEFAULT_HEIGHT_STAND);

        // Puts an outer border for style
        this.playAreaCanvas.strokeStyle = '#AAA38E';
        this.playAreaCanvas.lineWidth = Constants.SIZE_OUTER_BORDER_STAND;
        this.playAreaCanvas.strokeRect(
            Constants.SIZE_OUTER_BORDER_STAND / 2 + x,
            Constants.SIZE_OUTER_BORDER_STAND / 2 + y,
            Constants.DEFAULT_WIDTH_STAND - Constants.SIZE_OUTER_BORDER_STAND,
            Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND,
        );
        // Puts all the lines
        this.playAreaCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS;

        for (
            let i = Constants.SIZE_OUTER_BORDER_STAND + Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS / 2 + x;
            i < Constants.DEFAULT_WIDTH_STAND + x;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
        ) {
            // Put all the vertical lines of the board
            this.playAreaCanvas.moveTo(i, Constants.SIZE_OUTER_BORDER_STAND + y);
            this.playAreaCanvas.lineTo(i, Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND + y);
        }
        this.playAreaCanvas.stroke();

        if (!player) {
            return;
        }
        // If a player has been given, draw the player's stand
        for (
            let i = x + Constants.SIZE_OUTER_BORDER_STAND, j = 0;
            i < Constants.DEFAULT_WIDTH_STAND + x - Constants.SIZE_OUTER_BORDER_STAND && j < player.stand.length;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS, j++
        ) {
            if (!player.stand[j].letter || player.stand[j].letter.value === '') {
                continue;
            }

            // draws the background of the tile
            this.playAreaCanvas.fillStyle = '#F7F7E3';
            this.playAreaCanvas.fillRect(i, Constants.SIZE_OUTER_BORDER_STAND + y, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE);

            // draws the border of the tile
            this.playAreaCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
            this.playAreaCanvas.strokeStyle = '#54534A';
            this.roundRect(i, y + Constants.SIZE_OUTER_BORDER_STAND, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE, this.playAreaCanvas);

            const spaceForLetter: Vec2 = { x: 12, y: 26 };
            const spaceForNumber: Vec2 = { x: 27, y: 29 };
            // draws the letter on the tile
            this.playAreaCanvas.fillStyle = '#212121';
            this.playAreaCanvas.font = 'bold 17px Roboto';
            this.playAreaCanvas.fillText(
                player.stand[j].letter.value.toUpperCase(),
                i + spaceForLetter.x,
                y + Constants.SIZE_OUTER_BORDER_STAND + spaceForLetter.y,
            );
            // draws the weight of the letter on the tile
            this.playAreaCanvas.font = '10px Roboto';
            const letterWeight = player.stand[j].letter.weight;
            if (letterWeight) {
                this.playAreaCanvas.fillText(letterWeight.toString(), i + spaceForNumber.x, y + Constants.SIZE_OUTER_BORDER_STAND + spaceForNumber.y);
            }
            this.playAreaCanvas.stroke();
        }
    }

    getIndexOnStandLogicFromClick(positionX: number) {
        const constPosXYForStands =
            Constants.PADDING_BOARD_FOR_STANDS +
            Constants.DEFAULT_WIDTH_BOARD / 2 -
            Constants.DEFAULT_WIDTH_STAND / 2 +
            Constants.SIZE_OUTER_BORDER_STAND;
        const posXCleaned = positionX - constPosXYForStands;
        return Math.floor(Constants.DEFAULT_NB_LETTER_STAND / (Constants.DEFAULT_WIDTH_STAND / posXCleaned));
    }

    // Function to draw a rounded rectangle with a default radius of 8
    private roundRect(x1: number, y1: number, width: number, height: number, canvas: CanvasRenderingContext2D) {
        let radius = 8;
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        canvas.beginPath();
        canvas.moveTo(x1 + radius, y1);
        canvas.arcTo(x1 + width, y1, x1 + width, y1 + height, radius);
        canvas.arcTo(x1 + width, y1 + height, x1, y1 + height, radius);
        canvas.arcTo(x1, y1 + height, x1, y1, radius);
        canvas.arcTo(x1, y1, x1 + width, y1, radius);
        canvas.closePath();
        return this;
    }

    // the x and y are coords of the point in the top left corner of the stand
    private drawVertiStand(x: number, y: number, player?: Player) {
        this.playAreaCanvas.font = '19px bold system-ui';
        this.playAreaCanvas.beginPath();
        // Fill the rectangle with an initial color
        this.playAreaCanvas.fillStyle = '#BEB9A6';
        this.playAreaCanvas.fillRect(x, y, Constants.DEFAULT_HEIGHT_STAND, Constants.DEFAULT_WIDTH_STAND);

        // Puts an outer border for style
        this.playAreaCanvas.strokeStyle = '#AAA38E';
        this.playAreaCanvas.lineWidth = Constants.SIZE_OUTER_BORDER_STAND;
        this.playAreaCanvas.strokeRect(
            Constants.SIZE_OUTER_BORDER_STAND / 2 + x,
            Constants.SIZE_OUTER_BORDER_STAND / 2 + y,
            Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND,
            Constants.DEFAULT_WIDTH_STAND - Constants.SIZE_OUTER_BORDER_STAND,
        );
        // Puts all the lines
        this.playAreaCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS;
        for (
            let i = Constants.SIZE_OUTER_BORDER_STAND + Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS / 2 + y;
            i < Constants.DEFAULT_WIDTH_STAND + y;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
        ) {
            // Put all the vertical lines of the board
            this.playAreaCanvas.moveTo(Constants.SIZE_OUTER_BORDER_STAND + x, i);
            this.playAreaCanvas.lineTo(Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND + x, i);
        }
        this.playAreaCanvas.stroke();

        if (!player) {
            return;
        }
        // If a player has been given, draw the player's stand
        for (
            let i = y + Constants.SIZE_OUTER_BORDER_STAND, j = 0;
            i < Constants.DEFAULT_WIDTH_STAND + y - Constants.SIZE_OUTER_BORDER_STAND && j < player.stand.length;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS, j++
        ) {
            if (!player.stand[j].letter || player.stand[j].letter.value === '') {
                continue;
            }

            // draws the background of the tile
            this.playAreaCanvas.fillStyle = '#F7F7E3';
            this.playAreaCanvas.fillRect(x + Constants.SIZE_OUTER_BORDER_STAND, i, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE);

            // draws the border of the tile
            this.playAreaCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
            this.playAreaCanvas.strokeStyle = '#54534A';
            this.roundRect(x + Constants.SIZE_OUTER_BORDER_STAND, i, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE, this.playAreaCanvas);

            const spaceForLetter: Vec2 = { x: 12, y: 26 };
            const spaceForNumber: Vec2 = { x: 27, y: 29 };
            // draws the letter on the tile
            this.playAreaCanvas.fillStyle = '#212121';
            this.playAreaCanvas.font = 'bold 17px Roboto';
            this.playAreaCanvas.fillText(
                player.stand[j].letter.value.toUpperCase(),
                x + Constants.SIZE_OUTER_BORDER_STAND + spaceForLetter.x,
                i + spaceForLetter.y,
            );
            // draws the weight of the letter on the tile
            this.playAreaCanvas.font = '10px Roboto';
            const letterWeight = player.stand[j].letter.weight;
            if (letterWeight) {
                this.playAreaCanvas.fillText(letterWeight.toString(), x + Constants.SIZE_OUTER_BORDER_STAND + spaceForNumber.x, i + spaceForNumber.y);
            }
            this.playAreaCanvas.stroke();
        }
    }
}
