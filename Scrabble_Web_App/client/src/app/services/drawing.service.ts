import { Injectable } from '@angular/core';
import * as GlobalConstants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    canvasStand: CanvasRenderingContext2D;

    initStandCanvas(canvas: CanvasRenderingContext2D) {
        this.canvasStand = canvas;
    }

    reDrawStand(stand: Tile[], letterBank: Map<string, LetterData>) {
        this.initStand();
        for (let x = 0; x < GlobalConstants.NUMBER_SLOT_STAND; x++) {
            if (stand[x] !== undefined && stand[x].letter.value !== '') {
                this.drawOneLetter(stand[x].letter.value, stand[x], this.canvasStand, letterBank, stand[x].color);
            }
        }
    }

    resetColorTileStand(player: Player, letterBank: Map<string, LetterData>) {
        for (let x = 0; x < GlobalConstants.NUMBER_SLOT_STAND; x++) {
            if (player.stand[x] !== undefined && player.stand[x].letter.value !== '') {
                this.drawOneLetter(player.stand[x].letter.value, player.stand[x], this.canvasStand, letterBank, '#F7F7E3');
            }
        }
    }

    drawOneLetter(
        letterToDraw: string,
        tileArray: Tile,
        canvas: CanvasRenderingContext2D,
        letterBank: Map<string, LetterData>,
        color?: string,
        rectColor?: string,
    ) {
        const letterToDrawUpper = letterToDraw.toUpperCase();
        canvas.beginPath();
        if (color) {
            canvas.fillStyle = color;
        } else {
            canvas.fillStyle = '#F7F7E3';
        }
        canvas.strokeStyle = '#F7F7E3';
        canvas.fillRect(tileArray.position.x1 + 1, tileArray.position.y1 + 1, tileArray.position.width - 2, tileArray.position.height - 2);
        // the number are so the letter tiles are smaller than the tile of the board
        canvas.strokeStyle = '#54534A';
        canvas.lineWidth = GlobalConstants.WIDTH_LINE_BLOCKS / 2;
        if (rectColor) {
            canvas.strokeStyle = rectColor;
        } else {
            canvas.strokeStyle = '#54534A';
        }
        this.roundRect(tileArray.position.x1 + 1, tileArray.position.y1 + 1, tileArray.position.width - 2, tileArray.position.height - 2, canvas);
        // the number are so the letter tiles are smaller than the tile of the board
        canvas.fillStyle = '#212121';

        const letterData = letterBank.get(letterToDraw.toUpperCase());
        let letterWeight = 0;
        if (letterData) {
            letterWeight = letterData.weight;
        }
        const spaceForLetter: Vec2 = { x: 4, y: 25 };
        const spaceForNumber: Vec2 = { x: 23, y: 25 };
        const differenceSizeBetweenFonts = 6;
        const actualFont = canvas.font;
        canvas.font = actualFont;
        canvas.fillText(letterToDrawUpper, tileArray.position.x1 + spaceForLetter.x, tileArray.position.y1 + spaceForLetter.y);

        const sizeFontNumber = Number(actualFont.split('p')[0]) - differenceSizeBetweenFonts;
        canvas.font = sizeFontNumber.toString() + 'px bold system-ui';
        if (letterWeight) {
            canvas.fillText(letterWeight.toString(), tileArray.position.x1 + spaceForNumber.x, tileArray.position.y1 + spaceForNumber.y);
        } else {
            canvas.fillText('', tileArray.position.x1 + spaceForNumber.x, tileArray.position.y1 + spaceForNumber.y);
        }
        canvas.font = actualFont;
        canvas.stroke();
    }

    removeTile(tile: Tile) {
        tile.isOnBoard = true;
        this.canvasStand.beginPath();
        this.canvasStand.fillStyle = '#BEB9A6';
        this.canvasStand.fillRect(tile.position.x1, tile.position.y1, tile.position.width, tile.position.height);
        this.canvasStand.stroke();
    }

    areLettersRightClicked(stand: Tile[]) {
        for (const tile of stand) {
            if (tile.color === '#AEB1D9') {
                return true;
            }
        }
        return false;
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

    private initStand() {
        this.canvasStand.font = '19px bold system-ui';
        this.canvasStand.beginPath();
        // Fill the rectangle with an initial color
        this.canvasStand.fillStyle = '#BEB9A6';
        this.canvasStand.fillRect(0, 0, GlobalConstants.DEFAULT_WIDTH_STAND, GlobalConstants.DEFAULT_HEIGHT_STAND);

        // Puts an outer border for style
        this.canvasStand.strokeStyle = '#AAA38E';
        this.canvasStand.lineWidth = GlobalConstants.SIZE_OUTER_BORDER_STAND;
        this.canvasStand.strokeRect(
            GlobalConstants.SIZE_OUTER_BORDER_STAND / 2,
            GlobalConstants.SIZE_OUTER_BORDER_STAND / 2,
            GlobalConstants.DEFAULT_WIDTH_STAND - GlobalConstants.SIZE_OUTER_BORDER_STAND,
            GlobalConstants.DEFAULT_HEIGHT_STAND - GlobalConstants.SIZE_OUTER_BORDER_STAND,
        );
        // Puts all the lines
        this.canvasStand.lineWidth = GlobalConstants.WIDTH_LINE_BLOCKS;

        for (
            let i = GlobalConstants.SIZE_OUTER_BORDER_STAND + GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS / 2;
            i < GlobalConstants.DEFAULT_WIDTH_STAND;
            i += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS
        ) {
            // Put all the vertical lines of the board
            this.canvasStand.moveTo(i, GlobalConstants.SIZE_OUTER_BORDER_STAND);
            this.canvasStand.lineTo(i, GlobalConstants.DEFAULT_HEIGHT_STAND - GlobalConstants.SIZE_OUTER_BORDER_STAND);
        }
        this.canvasStand.stroke();
    }
}
