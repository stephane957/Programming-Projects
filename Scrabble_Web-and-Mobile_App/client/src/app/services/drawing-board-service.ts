/* eslint-disable max-lines*/
import { Injectable } from '@angular/core';
import * as Constants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { Socket } from 'socket.io-client';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class DrawingBoardService {
    playAreaCanvas: CanvasRenderingContext2D;
    tmpTileCanvas: CanvasRenderingContext2D;
    isArrowVertical: boolean;
    isArrowPlaced: boolean;
    arrowPosX: number;
    arrowPosY: number;
    // lettersDrawn is in fact the letter placed on the board
    // TODO change the name when we have time
    lettersDrawn: string;
    coordsLettersDrawn: Vec2[];
    private mapTileColours: Map<string, string>;

    constructor(private drawingService: DrawingService, private infoClientService: InfoClientService, private translateService: TranslateService) {
        this.initDefaultVariables();
        this.mapTileColours = new Map([
            ['xx', '#BEB9A6'],
            ['wordx3', '#f75d59'],
            ['wordx2', '#fbbbb9'],
            ['letterx3', '#157dec'],
            ['letterx2', '#a0cfec'],
        ]);
    }

    canvasInit(playAreaCanvas: CanvasRenderingContext2D, tmpTileCanvas: CanvasRenderingContext2D) {
        this.playAreaCanvas = playAreaCanvas;
        this.tmpTileCanvas = tmpTileCanvas;
        this.drawingService.canvasInit(playAreaCanvas, tmpTileCanvas);

        // Init basic board and stand visual
        this.drawBoardInit(this.infoClientService.game.bonusBoard);
        this.drawingService.initStand(true);
    }

    initDefaultVariables() {
        this.isArrowVertical = false;
        this.isArrowPlaced = false;
        this.arrowPosX = Constants.DEFAULT_VALUE_NUMBER;
        this.arrowPosY = Constants.DEFAULT_VALUE_NUMBER;
        this.lettersDrawn = '';
        this.coordsLettersDrawn = [];
    }

    drawBoardInit(bonusBoard: string[][]) {
        const paddingForStands = Constants.DEFAULT_HEIGHT_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        // we take out the first line and column because they aren't used
        // for the drawing of the board
        bonusBoard.splice(0, 1);
        bonusBoard = this.removeEl(bonusBoard, 0);
        if (this.playAreaCanvas.font === '10px sans-serif') {
            this.playAreaCanvas.font = '19px bold system-ui';
        }
        const savedFont = this.playAreaCanvas.font;
        this.playAreaCanvas.font = '19px bold system-ui';

        const mapTileColours: Map<string, string> = new Map([
            ['xx', '#BEB9A6'],
            ['wordx3', '#f75d59'],
            ['wordx2', '#fbbbb9'],
            ['letterx3', '#157dec'],
            ['letterx2', '#a0cfec'],
        ]);

        this.playAreaCanvas.beginPath();
        this.playAreaCanvas.strokeStyle = '#AAA38E';

        // Puts an outer border for style
        this.playAreaCanvas.lineWidth = Constants.SIZE_OUTER_BORDER_BOARD;
        this.playAreaCanvas.strokeRect(
            Constants.SIZE_OUTER_BORDER_BOARD / 2 + Constants.PADDING_BOARD_FOR_STANDS,
            Constants.SIZE_OUTER_BORDER_BOARD / 2 + Constants.PADDING_BOARD_FOR_STANDS,
            Constants.DEFAULT_WIDTH_BOARD - Constants.SIZE_OUTER_BORDER_BOARD,
            Constants.DEFAULT_HEIGHT_BOARD - Constants.SIZE_OUTER_BORDER_BOARD,
        );

        this.playAreaCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS;
        const fontSizeBonusWord = 'bold 11px system-ui';
        const shouldDrawStar = true;
        this.playAreaCanvas.font = fontSizeBonusWord;
        // Handles the color of each square
        for (let idxLine = 0; idxLine < Constants.NUMBER_SQUARE_H_AND_W; idxLine++) {
            for (let idxColumn = 0; idxColumn < Constants.NUMBER_SQUARE_H_AND_W; idxColumn++) {
                const tileData = mapTileColours.get(bonusBoard[idxLine][idxColumn]);
                if (tileData) {
                    this.playAreaCanvas.fillStyle = tileData;
                }
                this.drawTileAtPos(idxLine, bonusBoard, idxColumn);
            }
        }

        // Draws the  star
        if (shouldDrawStar) {
            this.drawStar(Constants.DEFAULT_HEIGHT_BOARD / 2 + paddingForStands);
        }

        // Set parameters to draw the lines of the grid
        this.playAreaCanvas.strokeStyle = '#AAA38E';
        this.playAreaCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS;
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
            let i = Constants.SIZE_OUTER_BORDER_BOARD + Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS / 2 + paddingForStands, j = 1;
            i < Constants.WIDTH_BOARD_NOBORDER + roundedRest + paddingForStands;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS, j++
        ) {
            // Put all the horizontal lines of the board
            this.playAreaCanvas.moveTo(paddingForStands, i);
            this.playAreaCanvas.lineTo(Constants.DEFAULT_WIDTH_BOARD + paddingForStands, i);

            // Put all the vectical lines of the board
            this.playAreaCanvas.moveTo(i, paddingForStands);
            this.playAreaCanvas.lineTo(i, Constants.DEFAULT_WIDTH_BOARD + paddingForStands);

            // Put all the letters/numbers on the board
            this.playAreaCanvas.fillStyle = '#54534A';
            this.playAreaCanvas.font = fontSizeLettersOnSide.toString() + 'px bold system-ui';

            if (j.toString().length === 1) {
                this.playAreaCanvas.fillText(
                    j.toString(),
                    i - Constants.WIDTH_EACH_SQUARE - Constants.WIDTH_LINE_BLOCKS / 2 + borderTopAndLeftBig,
                    jumpOfATile + paddingForStands,
                );
            } else {
                this.playAreaCanvas.fillText(
                    j.toString(),
                    i - Constants.WIDTH_EACH_SQUARE - Constants.WIDTH_LINE_BLOCKS / 2 + borderTopAndLeftLittle,
                    jumpOfATile + paddingForStands,
                );
            }
            this.playAreaCanvas.fillText(
                String.fromCharCode(asciiCodeStartLetters + j),
                borderTopAndLeftBig + paddingForStands,
                i - Constants.WIDTH_EACH_SQUARE - Constants.WIDTH_LINE_BLOCKS / 2 + jumpOfATile,
            );

            // Since our for loop stops at the index 14 we have to implement it manually
            // for the 15th number
            if (j === Constants.NUMBER_SQUARE_H_AND_W - 1) {
                j++;
                this.playAreaCanvas.fillText(j.toString(), i + borderTopAndLeftLittle, jumpOfATile + paddingForStands);
                this.playAreaCanvas.fillText(String.fromCharCode(asciiCodeStartLetters + j), borderTopAndLeftBig + paddingForStands, i + jumpOfATile);
            }
        }
        this.playAreaCanvas.font = savedFont;
        this.playAreaCanvas.stroke();
    }

    drawTileDraggedOnCanvas(clickedTile: Tile, mouseCoords: Vec2) {
        // clear the canvas to not have a trail of the tile
        this.clearCanvas(this.tmpTileCanvas);
        // draws the border of the tile being hovered to get a better understanding of where
        // the tile will be placed
        const boardIndexs: Vec2 = this.getIndexOnBoardLogicFromClick(mouseCoords);
        if (boardIndexs.x !== Constants.DEFAULT_VALUE_NUMBER && boardIndexs.y !== Constants.DEFAULT_VALUE_NUMBER) {
            this.drawBorderTileForTmpHover(boardIndexs);
        }
        // draw the tile on the tmp canvas
        this.drawingService.drawFromDrag(clickedTile, mouseCoords);
    }

    drawBorderTileForTmpHover(boardIndexs: Vec2) {
        if (!this.infoClientService.game.board[boardIndexs.y][boardIndexs.x]) {
            return;
        }
        const tileConcerned = this.infoClientService.game.board[boardIndexs.y][boardIndexs.x];
        this.tmpTileCanvas.beginPath();
        this.tmpTileCanvas.strokeStyle = '#9e2323';
        this.tmpTileCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS;
        this.tmpTileCanvas.rect(tileConcerned.position.x1, tileConcerned.position.y1, tileConcerned.position.height, tileConcerned.position.width);
        this.tmpTileCanvas.stroke();
    }

    clearCanvas(canvas: CanvasRenderingContext2D) {
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    }

    reDrawBoard(socket: Socket, bonusBoard: string[][], board: Tile[][], letterBank: Map<string, LetterData>) {
        this.drawBoardInit(bonusBoard);
        for (let x = 0; x < Constants.NUMBER_SQUARE_H_AND_W + 2; x++) {
            for (let y = 0; y < Constants.NUMBER_SQUARE_H_AND_W + 2; y++) {
                if (board[x][y] !== undefined && board[x][y].letter.value !== '') {
                    this.drawingService.drawOneLetter(board[x][y].letter.value, board[x][y], this.playAreaCanvas, letterBank);
                }
            }
        }

        // if this is our turn and we just put a letter on the board we redraw the arrow too
        if (this.infoClientService.isTurnOurs && this.isArrowPlaced && this.lettersDrawn) {
            if (this.isArrowVertical) {
                socket.emit('drawVerticalArrow', {
                    x: this.arrowPosX,
                    y: this.arrowPosY,
                });
            } else {
                socket.emit('drawHorizontalArrow', {
                    x: this.arrowPosX,
                    y: this.arrowPosY,
                });
            }
        }
    }

    reDrawOnlyTilesBoard(board: Tile[][], letterBank: Map<string, LetterData>) {
        for (let x = 0; x < Constants.NUMBER_SQUARE_H_AND_W + 2; x++) {
            for (let y = 0; y < Constants.NUMBER_SQUARE_H_AND_W + 2; y++) {
                if (board[x][y] !== undefined && board[x][y].letter.value !== '') {
                    this.drawingService.drawOneLetter(board[x][y].letter.value, board[x][y], this.playAreaCanvas, letterBank);
                }
            }
        }
    }

    drawHorizontalArrowDirection(verticalPosTile: number, horizontalPosTile: number) {
        this.tmpTileCanvas.strokeStyle = '#54534A';
        this.tmpTileCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
        this.tmpTileCanvas.beginPath();
        const oneFifthOfTile = 5;
        const oneFifthOfTileInDecimal = 1.25;
        const startPosXPx = this.startingPosPxOfTile(verticalPosTile - 1);
        const startPosYPx = this.startingPosPxOfTile(horizontalPosTile - 1);
        this.tmpTileCanvas.moveTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTile, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.tmpTileCanvas.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.tmpTileCanvas.stroke();
        this.tmpTileCanvas.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal);
        this.tmpTileCanvas.stroke();
        this.tmpTileCanvas.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.tmpTileCanvas.stroke();
        this.tmpTileCanvas.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTile);
        this.tmpTileCanvas.stroke();
        // this.arrowPosX = verticalPosTile;
        // this.arrowPosY = horizontalPosTile;
        this.tmpTileCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS;
    }

    drawVerticalArrowDirection(verticalPosTile: number, horizontalPosTile: number) {
        this.tmpTileCanvas.strokeStyle = '#54534A';
        this.tmpTileCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
        this.tmpTileCanvas.beginPath();
        const oneFifthOfTile = 5;
        const oneFifthOfTileInDecimal = 1.25;
        const startPosXPx = this.startingPosPxOfTile(verticalPosTile - 1);
        const startPosYPx = this.startingPosPxOfTile(horizontalPosTile - 1);
        this.tmpTileCanvas.moveTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTile);
        this.tmpTileCanvas.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal);
        this.tmpTileCanvas.stroke();
        this.tmpTileCanvas.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.tmpTileCanvas.stroke();
        this.tmpTileCanvas.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal);
        this.tmpTileCanvas.stroke();
        this.tmpTileCanvas.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTile, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.tmpTileCanvas.stroke();
        // this.arrowPosX = verticalPosTile;
        // this.arrowPosY = horizontalPosTile;
        this.tmpTileCanvas.lineWidth = Constants.WIDTH_LINE_BLOCKS;
    }

    drawTileAtPos(idxLine: number, bonusBoard: string[][], idxColumn: number, width?: number) {
        const paddingForStands = Constants.DEFAULT_HEIGHT_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        if (idxLine > Constants.NUMBER_SQUARE_H_AND_W || idxColumn > Constants.NUMBER_SQUARE_H_AND_W) {
            return;
        }
        const savedFont = this.playAreaCanvas.font;
        const fontSizeBonusWord = 'bold 11px system-ui';

        const borderTopAndLeft = 10;
        const marginForRoundedNumberAndLook = 2;
        this.playAreaCanvas.font = fontSizeBonusWord;
        const xPosPx =
            idxColumn * (Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS) +
            Constants.SIZE_OUTER_BORDER_BOARD -
            marginForRoundedNumberAndLook / 2 +
            paddingForStands;
        const yPosPx =
            idxLine * (Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS) +
            Constants.SIZE_OUTER_BORDER_BOARD -
            marginForRoundedNumberAndLook / 2 +
            paddingForStands;

        if (width || width === 0) {
            idxColumn += 1;
        }
        this.getFillTileColor(idxLine, idxColumn, bonusBoard);
        const isPosTheCenterTile: boolean =
            idxLine === Math.floor(Constants.NUMBER_SQUARE_H_AND_W / 2) && idxColumn - 1 === Math.floor(Constants.NUMBER_SQUARE_H_AND_W / 2);
        if (isPosTheCenterTile && this.isArrowPlaced) {
            this.redrawStar(xPosPx, yPosPx, width);
            this.playAreaCanvas.font = savedFont;
            return;
        }
        if (width || width === 0) {
            // width is there because we have to adjust the size of the square because they are bigger than what is visible
            this.playAreaCanvas.fillRect(xPosPx + width, yPosPx + width, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE);
        } else {
            this.playAreaCanvas.fillRect(
                xPosPx,
                yPosPx,
                Constants.WIDTH_EACH_SQUARE + marginForRoundedNumberAndLook,
                Constants.WIDTH_EACH_SQUARE + marginForRoundedNumberAndLook,
            );
        }
        if (bonusBoard[idxLine][idxColumn] !== 'xx') {
            this.playAreaCanvas.fillStyle = '#104D45';
            // We don't want to draw the letter on the center
            if (idxLine === (Constants.NUMBER_SQUARE_H_AND_W - 1) / 2 && idxColumn === (Constants.NUMBER_SQUARE_H_AND_W - 1) / 2) {
                this.playAreaCanvas.font = savedFont;
                return;
            }
            if (bonusBoard[idxLine][idxColumn].includes('letter')) {
                this.playAreaCanvas.fillText(
                    this.translateService.instant('LETTER'),
                    xPosPx + (Constants.WIDTH_EACH_SQUARE - this.playAreaCanvas.measureText('LETTRE').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + Constants.WIDTH_EACH_SQUARE / 2 + marginForRoundedNumberAndLook / 2,
                );
            } else {
                this.playAreaCanvas.fillText(
                    this.translateService.instant('WORD'),
                    xPosPx +
                        (Constants.WIDTH_EACH_SQUARE - this.playAreaCanvas.measureText(this.translateService.instant('WORD')).width) / 2 +
                        marginForRoundedNumberAndLook / 2,
                    yPosPx + Constants.WIDTH_EACH_SQUARE / 2 + marginForRoundedNumberAndLook / 2,
                );
            }
            if (bonusBoard[idxLine][idxColumn].includes('x2')) {
                this.playAreaCanvas.fillText(
                    'x2',
                    xPosPx + (Constants.WIDTH_EACH_SQUARE - this.playAreaCanvas.measureText('x2').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + Constants.WIDTH_EACH_SQUARE / 2 + borderTopAndLeft,
                );
            } else {
                this.playAreaCanvas.fillText(
                    'x3',
                    xPosPx + (Constants.WIDTH_EACH_SQUARE - this.playAreaCanvas.measureText('x3').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + Constants.WIDTH_EACH_SQUARE / 2 + borderTopAndLeft,
                );
            }
        }
        this.playAreaCanvas.font = savedFont;
    }

    removeTile(tile: Tile) {
        // remove a tile from the board but only visually
        this.playAreaCanvas.beginPath();
        this.playAreaCanvas.fillStyle = '#BEB9A6';
        this.playAreaCanvas.fillRect(tile.position.x1, tile.position.y1, tile.position.width + 1, tile.position.height + 1);
        this.playAreaCanvas.stroke();
    }

    findTileToPlaceArrow(socket: Socket, positionPx: Vec2, board: Tile[][]) {
        if (this.lettersDrawn) {
            return;
        }

        const coordsIndexOnBoard = this.getIndexOnBoardLogicFromClick(positionPx);
        if (board[coordsIndexOnBoard.y][coordsIndexOnBoard.x].old) {
            // check if the tile has a letter
            return; // if it does then we dont draw an arrow
        }

        if (this.arrowPosX !== coordsIndexOnBoard.x || this.arrowPosY !== coordsIndexOnBoard.y) {
            // if the tile clicked is another tile then reset the arrow direction
            this.isArrowVertical = true;
        }
        this.isArrowPlaced = true;
        if (this.isArrowVertical) {
            socket.emit('drawHorizontalArrow', {
                x: coordsIndexOnBoard.x,
                y: coordsIndexOnBoard.y,
            });
        } else {
            socket.emit('drawVerticalArrow', {
                x: coordsIndexOnBoard.x,
                y: coordsIndexOnBoard.y,
            });
        }
        this.arrowPosX = coordsIndexOnBoard.x;
        this.arrowPosY = coordsIndexOnBoard.y;
        this.isArrowVertical = !this.isArrowVertical;
    }

    getIndexOnBoardLogicFromClick(coords: Vec2): Vec2 {
        // we get rid of the border and the padding for the stands
        const coordsCleaned: Vec2 = new Vec2();
        coordsCleaned.x = coords.x - Constants.PADDING_BOARD_FOR_STANDS - Constants.SIZE_OUTER_BORDER_BOARD;
        coordsCleaned.y = coords.y - Constants.PADDING_BOARD_FOR_STANDS - Constants.SIZE_OUTER_BORDER_BOARD;
        // veryfiying that we are on the board not elsewhere
        if (coordsCleaned.x < 0 || coordsCleaned.y < 0) {
            return { x: Constants.DEFAULT_VALUE_NUMBER, y: Constants.DEFAULT_VALUE_NUMBER };
        }
        const coordsIndexOnBoard = new Vec2();
        coordsIndexOnBoard.x = Math.floor((1 / (Constants.WIDTH_BOARD_NOBORDER / coordsCleaned.x)) * Constants.NUMBER_SQUARE_H_AND_W) + 1;
        coordsIndexOnBoard.y = Math.floor((1 / (Constants.WIDTH_BOARD_NOBORDER / coordsCleaned.y)) * Constants.NUMBER_SQUARE_H_AND_W) + 1;
        if (
            coordsIndexOnBoard.x > Constants.NUMBER_SQUARE_H_AND_W ||
            coordsIndexOnBoard.y > Constants.NUMBER_SQUARE_H_AND_W ||
            coordsIndexOnBoard.x <= 0 ||
            coordsIndexOnBoard.y <= 0
        ) {
            return { x: Constants.DEFAULT_VALUE_NUMBER, y: Constants.DEFAULT_VALUE_NUMBER };
        }
        return coordsIndexOnBoard;
    }

    private getFillTileColor(xPos: number, yPos: number, bonusBoard: string[][]) {
        const tileData = this.mapTileColours.get(bonusBoard[xPos][yPos]);
        if (tileData) {
            this.playAreaCanvas.fillStyle = tileData;
        }
    }

    private startingPosPxOfTile(tilePos: number): number {
        const pxPos =
            Constants.PADDING_BOARD_FOR_STANDS +
            Constants.SIZE_OUTER_BORDER_BOARD +
            tilePos * Constants.WIDTH_EACH_SQUARE +
            tilePos * Constants.WIDTH_LINE_BLOCKS;
        return pxPos;
    }

    private redrawStar(xPosPx: number, yPosPx: number, width?: number) {
        if (width) {
            this.playAreaCanvas.fillRect(xPosPx + width, yPosPx + width, Constants.WIDTH_EACH_SQUARE - width, Constants.WIDTH_EACH_SQUARE - width);
        } else {
            return;
        }
        const xyPxForStar = Constants.PADDING_BOARD_FOR_STANDS + Constants.DEFAULT_HEIGHT_BOARD / 2;
        this.drawStar(xyPxForStar);
    }

    private drawStar(centerXY: number) {
        const nbSpike = 6;
        const shiftValueForCenteredStar = 5;
        const radius = Constants.WIDTH_EACH_SQUARE / 2 - shiftValueForCenteredStar;

        // star draw
        this.playAreaCanvas.fillStyle = '#AAA38E';
        this.playAreaCanvas.beginPath();
        this.playAreaCanvas.moveTo(centerXY + radius, centerXY);

        let theta = 0;
        let x = 0;
        let y = 0;
        for (let i = 1; i <= nbSpike * 2; i++) {
            if (i % 2 === 0) {
                theta = (i * (Math.PI * 2)) / (nbSpike * 2);
                x = centerXY + radius * Math.cos(theta);
                y = centerXY + radius * Math.sin(theta);
            } else {
                theta = (i * (Math.PI * 2)) / (nbSpike * 2);
                x = centerXY + (radius / 2) * Math.cos(theta);
                y = centerXY + (radius / 2) * Math.sin(theta);
            }
            this.playAreaCanvas.lineTo(x, y);
        }
        this.playAreaCanvas.closePath();
        this.playAreaCanvas.fill();
    }

    private removeEl(array: string[][], remIdx: number) {
        return array.map((arr) => {
            return arr.filter((el, idx) => {
                return idx !== remIdx;
            });
        });
    }
}
