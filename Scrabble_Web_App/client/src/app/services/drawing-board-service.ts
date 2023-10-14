/* eslint-disable max-lines*/
import { Injectable } from '@angular/core';
import * as GlobalConstants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from './drawing.service';

@Injectable({
    providedIn: 'root',
})
export class DrawingBoardService {
    boardCanvas: CanvasRenderingContext2D;
    isArrowVertical: boolean;
    isArrowPlaced: boolean;
    arrowPosX: number;
    arrowPosY: number;
    lettersDrawn: string;
    private mapTileColours: Map<string, string>;

    constructor(private drawingService: DrawingService) {
        this.isArrowVertical = false;
        this.isArrowPlaced = false;
        this.arrowPosX = GlobalConstants.DEFAULT_VALUE_NUMBER;
        this.arrowPosY = GlobalConstants.DEFAULT_VALUE_NUMBER;
        this.lettersDrawn = '';
        this.mapTileColours = new Map([
            ['xx', '#BEB9A6'],
            ['wordx3', '#f75d59'],
            ['wordx2', '#fbbbb9'],
            ['letterx3', '#157dec'],
            ['letterx2', '#a0cfec'],
        ]);
    }

    canvasInit(canvas: CanvasRenderingContext2D) {
        this.boardCanvas = canvas;
    }

    drawBoardInit(bonusBoard: string[][]) {
        // we take out the first line and column because she isn't used for the drawing of the board
        bonusBoard.splice(0, 1);
        bonusBoard = this.removeEl(bonusBoard, 0);
        if (this.boardCanvas.font === '10px sans-serif') {
            this.boardCanvas.font = '19px bold system-ui';
        }
        const savedFont = this.boardCanvas.font;
        this.boardCanvas.font = '19px bold system-ui';

        const mapTileColours: Map<string, string> = new Map([
            ['xx', '#BEB9A6'],
            ['wordx3', '#f75d59'],
            ['wordx2', '#fbbbb9'],
            ['letterx3', '#157dec'],
            ['letterx2', '#a0cfec'],
        ]);

        this.boardCanvas.beginPath();
        this.boardCanvas.strokeStyle = '#AAA38E';

        // Puts an outer border for style
        this.boardCanvas.lineWidth = GlobalConstants.SIZE_OUTER_BORDER_BOARD;
        this.boardCanvas.strokeRect(
            GlobalConstants.SIZE_OUTER_BORDER_BOARD / 2,
            GlobalConstants.SIZE_OUTER_BORDER_BOARD / 2,
            GlobalConstants.DEFAULT_WIDTH_BOARD - GlobalConstants.SIZE_OUTER_BORDER_BOARD,
            GlobalConstants.DEFAULT_HEIGHT_BOARD - GlobalConstants.SIZE_OUTER_BORDER_BOARD,
        );

        this.boardCanvas.lineWidth = GlobalConstants.WIDTH_LINE_BLOCKS;
        const fontSizeBonusWord = 'bold 11px system-ui';
        const shouldDrawStar = true;
        this.boardCanvas.font = fontSizeBonusWord;
        // Handles the color of each square
        for (let x = 0; x < GlobalConstants.NUMBER_SQUARE_H_AND_W; x++) {
            for (let y = 0; y < GlobalConstants.NUMBER_SQUARE_H_AND_W; y++) {
                const tileData = mapTileColours.get(bonusBoard[x][y]);
                if (tileData) {
                    this.boardCanvas.fillStyle = tileData;
                }
                this.drawTileAtPos(x, bonusBoard, y);
            }
        }

        // Draws the  star
        if (shouldDrawStar) {
            this.drawStar(GlobalConstants.DEFAULT_HEIGHT_BOARD / 2, GlobalConstants.DEFAULT_WIDTH_BOARD / 2);
        }

        // Set parameters to draw the lines of the grid
        this.boardCanvas.strokeStyle = '#AAA38E';
        this.boardCanvas.lineWidth = GlobalConstants.WIDTH_LINE_BLOCKS;
        // So we don't have magic values
        const jumpOfATile = 30;
        const asciiCodeStartLetters = 64;
        const fontSizeLettersOnSide = 25;
        const borderTopAndLeftBig = 14;
        const borderTopAndLeftLittle = 5;
        // The variable widthEachSquare being not a round number there is a rest that we need to use
        // in the next function
        const roundedRest = 1;
        for (
            let i = GlobalConstants.SIZE_OUTER_BORDER_BOARD + GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS / 2, j = 1;
            i < GlobalConstants.WIDTH_BOARD_NOBORDER + roundedRest;
            i += GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS, j++
        ) {
            // Put all the horizontal lines of the board
            this.boardCanvas.moveTo(0, i);
            this.boardCanvas.lineTo(GlobalConstants.DEFAULT_WIDTH_BOARD, i);

            // Put all the vectical lines of the board
            this.boardCanvas.moveTo(i, 0);
            this.boardCanvas.lineTo(i, GlobalConstants.DEFAULT_WIDTH_BOARD);

            // Put all the letters/numbers on the board
            this.boardCanvas.fillStyle = '#54534A';
            this.boardCanvas.font = fontSizeLettersOnSide.toString() + 'px bold system-ui';

            if (j.toString().length === 1) {
                this.boardCanvas.fillText(
                    j.toString(),
                    i - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS / 2 + borderTopAndLeftBig,
                    jumpOfATile,
                );
            } else {
                this.boardCanvas.fillText(
                    j.toString(),
                    i - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS / 2 + borderTopAndLeftLittle,
                    jumpOfATile,
                );
            }
            this.boardCanvas.fillText(
                String.fromCharCode(asciiCodeStartLetters + j),
                borderTopAndLeftBig,
                i - GlobalConstants.WIDTH_EACH_SQUARE - GlobalConstants.WIDTH_LINE_BLOCKS / 2 + jumpOfATile,
            );

            // Since our for loop stops at the index 14 we have to implement it manually
            // for the 15th number
            if (j === GlobalConstants.NUMBER_SQUARE_H_AND_W - 1) {
                j++;
                this.boardCanvas.fillText(j.toString(), i + borderTopAndLeftLittle, jumpOfATile);
                this.boardCanvas.fillText(String.fromCharCode(asciiCodeStartLetters + j), borderTopAndLeftBig, i + jumpOfATile);
            }
        }
        this.boardCanvas.font = savedFont;

        this.boardCanvas.stroke();
    }

    reDrawBoard(bonusBoard: string[][], board: Tile[][], letterBank: Map<string, LetterData>) {
        this.drawBoardInit(bonusBoard);
        for (let x = 0; x < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2; x++) {
            for (let y = 0; y < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2; y++) {
                if (board[x][y] !== undefined && board[x][y].letter.value !== '') {
                    this.drawingService.drawOneLetter(board[x][y].letter.value, board[x][y], this.boardCanvas, letterBank);
                }
            }
        }
    }

    reDrawOnlyTilesBoard(board: Tile[][], letterBank: Map<string, LetterData>) {
        for (let x = 0; x < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2; x++) {
            for (let y = 0; y < GlobalConstants.NUMBER_SQUARE_H_AND_W + 2; y++) {
                if (board[x][y] !== undefined && board[x][y].letter.value !== '') {
                    this.drawingService.drawOneLetter(board[x][y].letter.value, board[x][y], this.boardCanvas, letterBank);
                }
            }
        }
    }

    drawHorizontalArrowDirection(verticalPosTile: number, horizontalPosTile: number) {
        this.boardCanvas.strokeStyle = '#54534A';
        this.boardCanvas.lineWidth = GlobalConstants.WIDTH_LINE_BLOCKS / 2;
        this.boardCanvas.beginPath();
        const oneFifthOfTile = 5;
        const oneFifthOfTileInDecimal = 1.25;
        const startPosXPx = this.startingPosPxOfTile(verticalPosTile - 1);
        const startPosYPx = this.startingPosPxOfTile(horizontalPosTile - 1);
        this.boardCanvas.moveTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTile,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
        );
        this.boardCanvas.lineTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
        );
        this.boardCanvas.stroke();
        this.boardCanvas.lineTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal,
        );
        this.boardCanvas.stroke();
        this.boardCanvas.lineTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
        );
        this.boardCanvas.stroke();
        this.boardCanvas.lineTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTile,
        );
        this.boardCanvas.stroke();
        this.arrowPosX = verticalPosTile;
        this.arrowPosY = horizontalPosTile;
        this.boardCanvas.lineWidth = GlobalConstants.WIDTH_LINE_BLOCKS;
    }

    drawVerticalArrowDirection(verticalPosTile: number, horizontalPosTile: number) {
        this.boardCanvas.strokeStyle = '#54534A';
        this.boardCanvas.lineWidth = GlobalConstants.WIDTH_LINE_BLOCKS / 2;
        this.boardCanvas.beginPath();
        const oneFifthOfTile = 5;
        const oneFifthOfTileInDecimal = 1.25;
        const startPosXPx = this.startingPosPxOfTile(verticalPosTile - 1);
        const startPosYPx = this.startingPosPxOfTile(horizontalPosTile - 1);
        this.boardCanvas.moveTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTile,
        );
        this.boardCanvas.lineTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal,
        );
        this.boardCanvas.stroke();
        this.boardCanvas.lineTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
        );
        this.boardCanvas.stroke();
        this.boardCanvas.lineTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal,
        );
        this.boardCanvas.stroke();
        this.boardCanvas.lineTo(
            startPosXPx + GlobalConstants.WIDTH_EACH_SQUARE / oneFifthOfTile,
            startPosYPx + GlobalConstants.WIDTH_EACH_SQUARE / 2,
        );
        this.boardCanvas.stroke();
        this.arrowPosX = verticalPosTile;
        this.arrowPosY = horizontalPosTile;
        this.boardCanvas.lineWidth = GlobalConstants.WIDTH_LINE_BLOCKS;
    }

    drawTileAtPos(xPos: number, bonusBoard: string[][], yPos: number, width?: number) {
        if (xPos > GlobalConstants.NUMBER_SQUARE_H_AND_W || yPos > GlobalConstants.NUMBER_SQUARE_H_AND_W) {
            return;
        }
        const savedFont = this.boardCanvas.font;
        const fontSizeBonusWord = 'bold 11px system-ui';

        const borderTopAndLeft = 10;
        const marginForRoundedNumberAndLook = 2;
        this.boardCanvas.font = fontSizeBonusWord;
        const xPosPx =
            xPos * (GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS) +
            GlobalConstants.SIZE_OUTER_BORDER_BOARD -
            marginForRoundedNumberAndLook / 2;
        const yPosPx =
            yPos * (GlobalConstants.WIDTH_EACH_SQUARE + GlobalConstants.WIDTH_LINE_BLOCKS) +
            GlobalConstants.SIZE_OUTER_BORDER_BOARD -
            marginForRoundedNumberAndLook / 2;
        if (width || width === 0) {
            yPos += 1;
        }
        this.getFillTileColor(xPos, yPos, bonusBoard);
        const isPosTheCenterTile: boolean =
            xPos === Math.floor(GlobalConstants.NUMBER_SQUARE_H_AND_W / 2) && yPos - 1 === Math.floor(GlobalConstants.NUMBER_SQUARE_H_AND_W / 2);
        if (isPosTheCenterTile && this.isArrowPlaced) {
            this.redrawStar(xPosPx, yPosPx, width);
            this.boardCanvas.font = savedFont;
            return;
        }
        if (width || width === 0) {
            // width is there because we have to adjust the size of the square because they are bigger than what is visible
            this.boardCanvas.fillRect(xPosPx + width, yPosPx + width, GlobalConstants.WIDTH_EACH_SQUARE, GlobalConstants.WIDTH_EACH_SQUARE);
        } else {
            this.boardCanvas.fillRect(
                xPosPx,
                yPosPx,
                GlobalConstants.WIDTH_EACH_SQUARE + marginForRoundedNumberAndLook,
                GlobalConstants.WIDTH_EACH_SQUARE + marginForRoundedNumberAndLook,
            );
        }
        if (bonusBoard[xPos][yPos] !== 'xx') {
            this.boardCanvas.fillStyle = '#104D45';
            // We don't want to draw the letter on the center
            if (xPos === (GlobalConstants.NUMBER_SQUARE_H_AND_W - 1) / 2 && yPos === (GlobalConstants.NUMBER_SQUARE_H_AND_W - 1) / 2) {
                this.boardCanvas.font = savedFont;
                return;
            }
            if (bonusBoard[xPos][yPos].includes('letter')) {
                this.boardCanvas.fillText(
                    'LETTRE',
                    xPosPx +
                        (GlobalConstants.WIDTH_EACH_SQUARE - this.boardCanvas.measureText('LETTRE').width) / 2 +
                        marginForRoundedNumberAndLook / 2,
                    yPosPx + GlobalConstants.WIDTH_EACH_SQUARE / 2 + marginForRoundedNumberAndLook / 2,
                );
            } else {
                this.boardCanvas.fillText(
                    'MOT',
                    xPosPx + (GlobalConstants.WIDTH_EACH_SQUARE - this.boardCanvas.measureText('MOT').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + GlobalConstants.WIDTH_EACH_SQUARE / 2 + marginForRoundedNumberAndLook / 2,
                );
            }
            if (bonusBoard[xPos][yPos].includes('x2')) {
                this.boardCanvas.fillText(
                    'x2',
                    xPosPx + (GlobalConstants.WIDTH_EACH_SQUARE - this.boardCanvas.measureText('x2').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + GlobalConstants.WIDTH_EACH_SQUARE / 2 + borderTopAndLeft,
                );
            } else {
                this.boardCanvas.fillText(
                    'x3',
                    xPosPx + (GlobalConstants.WIDTH_EACH_SQUARE - this.boardCanvas.measureText('x3').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + GlobalConstants.WIDTH_EACH_SQUARE / 2 + borderTopAndLeft,
                );
            }
        }
        this.boardCanvas.font = savedFont;
    }

    removeTile(tile: Tile) {
        // remove a tile from the board but only visually
        this.boardCanvas.beginPath();
        this.boardCanvas.fillStyle = '#BEB9A6';
        this.boardCanvas.fillRect(tile.position.x1, tile.position.y1, tile.position.width + 1, tile.position.height + 1);
        this.boardCanvas.stroke();
    }

    findTileToPlaceArrow(positionPx: Vec2, board: Tile[][], bonusBoard: string[][]) {
        if (this.lettersDrawn) {
            return;
        }
        const verticalPosTile: number =
            Math.floor((1 / (GlobalConstants.WIDTH_BOARD_NOBORDER / positionPx.x)) * GlobalConstants.NUMBER_SQUARE_H_AND_W) + 1;
        const horizontalPosTile: number =
            Math.floor((1 / (GlobalConstants.WIDTH_BOARD_NOBORDER / positionPx.y)) * GlobalConstants.NUMBER_SQUARE_H_AND_W) + 1;
        if (board[horizontalPosTile][verticalPosTile].old) {
            // check if the tile has a letter
            return; // if it does then we dont draw an arrow
        }
        if ((this.arrowPosX <= GlobalConstants.NUMBER_SQUARE_H_AND_W, this.arrowPosY <= GlobalConstants.NUMBER_SQUARE_H_AND_W)) {
            if (this.arrowPosX >= 0 && !board[this.arrowPosY][this.arrowPosX].old) {
                // erase the arrow if there was an arrow before and make sure there is no tile on top of it
                this.drawTileAtPos(this.arrowPosX - 1, bonusBoard, this.arrowPosY - 1, 1);
            }
        }
        if (this.arrowPosX !== verticalPosTile || this.arrowPosY !== horizontalPosTile) {
            // if the tile clicked is another tile then reset the arrow direction
            this.isArrowVertical = true;
        }
        this.isArrowPlaced = true;
        if (this.isArrowVertical) {
            this.drawHorizontalArrowDirection(verticalPosTile, horizontalPosTile);
        } else {
            this.drawVerticalArrowDirection(verticalPosTile, horizontalPosTile);
        }
        this.isArrowVertical = !this.isArrowVertical;
    }

    private getFillTileColor(xPos: number, yPos: number, bonusBoard: string[][]) {
        const tileData = this.mapTileColours.get(bonusBoard[xPos][yPos]);
        if (tileData) {
            this.boardCanvas.fillStyle = tileData;
        }
    }

    private startingPosPxOfTile(tilePos: number): number {
        return (tilePos + 1) * GlobalConstants.WIDTH_EACH_SQUARE + tilePos * GlobalConstants.WIDTH_LINE_BLOCKS;
    }

    private redrawStar(xPosPx: number, yPosPx: number, width?: number) {
        if (width) {
            this.boardCanvas.fillRect(
                xPosPx + width,
                yPosPx + width,
                GlobalConstants.WIDTH_EACH_SQUARE - width,
                GlobalConstants.WIDTH_EACH_SQUARE - width,
            );
        } else {
            return;
        }
        this.drawStar(GlobalConstants.DEFAULT_HEIGHT_BOARD / 2, GlobalConstants.DEFAULT_WIDTH_BOARD / 2);
    }

    private drawStar(centerX: number, centerY: number) {
        const nbSpike = 6;
        const shiftValueForCenteredStar = 5;
        const radius = GlobalConstants.WIDTH_EACH_SQUARE / 2 - shiftValueForCenteredStar;

        // star draw
        this.boardCanvas.fillStyle = '#AAA38E';
        this.boardCanvas.beginPath();
        this.boardCanvas.moveTo(centerX + radius, centerY);

        let theta = 0;
        let x = 0;
        let y = 0;
        for (let i = 1; i <= nbSpike * 2; i++) {
            if (i % 2 === 0) {
                theta = (i * (Math.PI * 2)) / (nbSpike * 2);
                x = centerX + radius * Math.cos(theta);
                y = centerY + radius * Math.sin(theta);
            } else {
                theta = (i * (Math.PI * 2)) / (nbSpike * 2);
                x = centerX + (radius / 2) * Math.cos(theta);
                y = centerY + (radius / 2) * Math.sin(theta);
            }
            this.boardCanvas.lineTo(x, y);
        }
        this.boardCanvas.closePath();
        this.boardCanvas.fill();
    }

    private removeEl(array: string[][], remIdx: number) {
        return array.map((arr) => {
            return arr.filter((el, idx) => {
                return idx !== remIdx;
            });
        });
    }
}
