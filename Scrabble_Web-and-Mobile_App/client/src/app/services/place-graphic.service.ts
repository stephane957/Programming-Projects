/* eslint-disable max-lines*/
import { Injectable } from '@angular/core';
import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { DrawingBoardService } from './drawing-board-service';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';
import { Socket } from 'socket.io-client';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class PlaceGraphicService {
    startLettersPlacedPosX: number;
    startLettersPlacedPosY: number;
    placeMethodIsDragDrop: boolean;
    // variable used to tell if a clicked tile comes from the stand or
    // the board
    tileClickedFromStand: boolean;

    constructor(
        private drawingBoardService: DrawingBoardService,
        private drawingService: DrawingService,
        private infoClientService: InfoClientService,
        private translate: TranslateService,
    ) {
        this.initDefaultVariables();
    }

    initDefaultVariables() {
        this.startLettersPlacedPosX = 0;
        this.startLettersPlacedPosY = 0;
        this.placeMethodIsDragDrop = false;
        this.tileClickedFromStand = false;
    }

    manageKeyboardEvent(game: GameServer, player: Player, keyEntered: string, socket: Socket) {
        if (this.infoClientService.displayTurn !== this.translate.instant('GAME.ITS_YOUR_TURN')) {
            return;
        }
        keyEntered = keyEntered.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        switch (keyEntered) {
            case 'Enter': {
                if (!this.drawingBoardService.lettersDrawn || this.drawingBoardService.lettersDrawn === '') {
                    return;
                }

                this.placeDrawnLettersInGoodOrder();
                // reconstruct the word if it is using a letter
                // already on the board
                this.drawingBoardService.lettersDrawn = this.constructWord();
                const placeMsg: string = this.createPlaceMessage();

                // eslint-disable-next-line no-console
                console.log('FinalWord: ' + placeMsg);
                // clear the tmporary canvas to get rid of all unecessary drawings
                // for example the arrow
                socket.emit('clearTmpTileCanvas');
                socket.emit('newMessageClient', placeMsg);
                this.resetVariablePlacement();
                return;
            }
            case 'Backspace': {
                if (!this.drawingBoardService.lettersDrawn || this.placeMethodIsDragDrop) {
                    return;
                }
                this.deleteLetterPlacedOnBoard(game, socket);
                if (this.drawingBoardService.lettersDrawn.length === 0) {
                    this.resetVariablePlacement();
                }
                return;
            }
            case 'Escape': {
                // deletes the arrow and removes all the tmpTiles (pink ones)
                socket.emit('escapeKeyPressed', this.drawingBoardService.lettersDrawn);
                this.resetVariablePlacement();
                return;
            }
        }
        if (
            this.drawingBoardService.arrowPosX > Constants.NUMBER_SQUARE_H_AND_W ||
            this.drawingBoardService.arrowPosY > Constants.NUMBER_SQUARE_H_AND_W ||
            !this.isArrowsEnabled()
        ) {
            return;
        }
        if (this.drawingBoardService.lettersDrawn === '') {
            this.startLettersPlacedPosX = this.drawingBoardService.arrowPosX;
            this.startLettersPlacedPosY = this.drawingBoardService.arrowPosY;
        }
        let letterPos: number;
        if (keyEntered.toUpperCase() === keyEntered) {
            // if character is not a letter we return and do nothing
            if (!keyEntered.match(/[A-Z]/i)) {
                return;
            }
            letterPos = this.findIndexLetterInStandForPlacement('*', false, player);
        } else {
            letterPos = this.findIndexLetterInStandForPlacement(keyEntered, false, player);
        }

        if (letterPos === Constants.DEFAULT_VALUE_NUMBER) {
            return;
        }

        socket.emit('rmTileFromStand', player.stand[letterPos]);

        const xIndex = this.drawingBoardService.arrowPosX;
        const yIndex = this.drawingBoardService.arrowPosY;

        this.drawContinuousArrow(game, keyEntered, socket);
        socket.emit('addTempLetterBoard', keyEntered, xIndex, yIndex);
    }

    isLettersDrawnSizeAboveZero(): boolean {
        return this.drawingBoardService.lettersDrawn !== '';
    }

    getClikedStandTile(positionX: number): Tile {
        const finalIndex = this.drawingService.getIndexOnStandLogicFromClick(positionX);
        return this.infoClientService.player.stand[finalIndex];
    }

    getClikedBoardTile(mouseCoords: Vec2): Tile | undefined {
        const idxCoords = this.drawingBoardService.getIndexOnBoardLogicFromClick(mouseCoords);
        if (idxCoords.x === Constants.DEFAULT_VALUE_NUMBER || idxCoords.y === Constants.DEFAULT_VALUE_NUMBER) {
            return undefined;
        }
        const clickedTile = this.infoClientService.game.board[idxCoords.y][idxCoords.x];
        // if the tile is old it means that this is not a temporary tile and
        // we don't want to be able to touch it
        if (clickedTile.old) {
            return undefined;
        } else {
            return clickedTile;
        }
    }

    drapDropEnabled(): boolean {
        return this.placeMethodIsDragDrop || this.drawingBoardService.lettersDrawn === '';
    }

    isArrowsEnabled() {
        return !this.placeMethodIsDragDrop || this.drawingBoardService.lettersDrawn === '';
    }

    resetVariablePlacement() {
        this.drawingBoardService.lettersDrawn = '';
        this.drawingBoardService.coordsLettersDrawn = [];
        this.drawingBoardService.isArrowPlaced = false;
        this.placeMethodIsDragDrop = false;
    }

    // function that make the word whole in case it is using a letter already on the board
    // for exemple lets say an "i" is on the board and we want to place the word "vie"
    // using the tile already on the board. The constant "lettersDrawn" will have "ve" so
    // we need to reconstruct the word to also take the "i" from the board.
    private constructWord(): string {
        let finalWord: string = this.drawingBoardService.lettersDrawn[0];
        let lastXPos: number = this.drawingBoardService.coordsLettersDrawn[0].x;
        let lastYPos: number = this.drawingBoardService.coordsLettersDrawn[0].y;
        for (let i = 1; i < this.drawingBoardService.coordsLettersDrawn.length; i++) {
            if (this.isWordVertical(this.drawingBoardService.coordsLettersDrawn)) {
                if (this.drawingBoardService.coordsLettersDrawn[i].y === lastYPos + 1) {
                    finalWord += this.drawingBoardService.lettersDrawn[i];
                    lastYPos = this.drawingBoardService.coordsLettersDrawn[i].y;
                } else {
                    // in some cases the word is not continuous on the board so we check for index and leave
                    // if the index is superior to the length of the board
                    if (lastYPos + 1 > Constants.NUMBER_SQUARE_H_AND_W) {
                        return finalWord;
                    }

                    // had some problem where the tile would be undefined. Didn't find why since it never happend again in a lot of game
                    // but putting this check as a precaution
                    if (this.infoClientService.game.board[lastYPos + 1][this.drawingBoardService.coordsLettersDrawn[i].x]) {
                        finalWord += this.infoClientService.game.board[lastYPos + 1][this.drawingBoardService.coordsLettersDrawn[i].x].letter.value;
                    }
                    lastYPos = lastYPos + 1;
                    // we want to check the same index as the one we tried since it was a tile from the board
                    i--;
                }
            } else {
                if (this.drawingBoardService.coordsLettersDrawn[i].x === lastXPos + 1) {
                    finalWord += this.drawingBoardService.lettersDrawn[i];
                    lastXPos = this.drawingBoardService.coordsLettersDrawn[i].x;
                } else {
                    // in some cases the word is not continuous on the board so we check for index and leave
                    // if the index is superior to the length of the board
                    if (lastXPos + 1 > Constants.NUMBER_SQUARE_H_AND_W) {
                        return finalWord;
                    }

                    // had some problem where the tile would be undefined. Didn't find why since it never happend again in a lot of game
                    // but putting this check as a precaution
                    if (this.infoClientService.game.board[this.drawingBoardService.coordsLettersDrawn[i].y][lastXPos + 1]) {
                        finalWord += this.infoClientService.game.board[this.drawingBoardService.coordsLettersDrawn[i].y][lastXPos + 1].letter.value;
                    }
                    lastXPos = lastXPos + 1;
                    // we want to check the same index as the one we tried since it was a tile from the board
                    i--;
                }
            }
        }

        return finalWord;
    }

    // function that changes the order of the letter in letterDrawn variable
    // depending on the coordonates of each letter
    private placeDrawnLettersInGoodOrder() {
        // deep copies
        let lettersDrawnCpy = (' ' + this.drawingBoardService.lettersDrawn).slice(1);
        const coordsLettersDrawnCpy = [...this.drawingBoardService.coordsLettersDrawn];

        this.drawingBoardService.lettersDrawn = '';
        this.drawingBoardService.coordsLettersDrawn = [];

        if (this.isWordVertical(coordsLettersDrawnCpy)) {
            for (let i = 0; i < lettersDrawnCpy.length; i++) {
                let minIndex = 0;
                for (let j = 0; j < lettersDrawnCpy.length; j++) {
                    if (coordsLettersDrawnCpy[j].y < coordsLettersDrawnCpy[minIndex].y) {
                        minIndex = j;
                    }
                }
                this.drawingBoardService.lettersDrawn += lettersDrawnCpy[minIndex];
                this.drawingBoardService.coordsLettersDrawn.push(coordsLettersDrawnCpy[minIndex]);

                coordsLettersDrawnCpy.splice(minIndex, 1);
                lettersDrawnCpy = lettersDrawnCpy.substring(0, minIndex) + lettersDrawnCpy.substring(minIndex + 1, lettersDrawnCpy.length);
                i--;
            }
        } else {
            for (let i = 0; i < lettersDrawnCpy.length; i++) {
                let minIndex = 0;
                for (let j = 0; j < lettersDrawnCpy.length; j++) {
                    if (coordsLettersDrawnCpy[j].x < coordsLettersDrawnCpy[minIndex].x) {
                        minIndex = j;
                    }
                }
                this.drawingBoardService.lettersDrawn += lettersDrawnCpy[minIndex];
                this.drawingBoardService.coordsLettersDrawn.push(coordsLettersDrawnCpy[minIndex]);

                coordsLettersDrawnCpy.splice(minIndex, 1);
                lettersDrawnCpy = lettersDrawnCpy.substring(0, minIndex) + lettersDrawnCpy.substring(minIndex + 1, lettersDrawnCpy.length);
                i--;
            }
        }
        this.startLettersPlacedPosX = this.drawingBoardService.coordsLettersDrawn[0].x;
        this.startLettersPlacedPosY = this.drawingBoardService.coordsLettersDrawn[0].y;
    }

    private createPlaceMessage(): string {
        const posStartWordX: number = this.startLettersPlacedPosX;
        let posStartWordY: number = this.startLettersPlacedPosY;
        posStartWordY += Constants.ASCII_CODE_SHIFT;
        let placerCmd = '!placer ' + String.fromCodePoint(posStartWordY) + posStartWordX.toString();
        if (this.drawingBoardService.isArrowPlaced) {
            if (this.drawingBoardService.isArrowVertical) {
                placerCmd += 'v ' + this.drawingBoardService.lettersDrawn;
            } else {
                placerCmd += 'h ' + this.drawingBoardService.lettersDrawn;
            }
        } else {
            if (this.isWordVertical(this.drawingBoardService.coordsLettersDrawn)) {
                placerCmd += 'v ' + this.drawingBoardService.lettersDrawn;
            } else {
                placerCmd += 'h ' + this.drawingBoardService.lettersDrawn;
            }
        }

        return placerCmd;
    }

    private isWordVertical(letterCoords: Vec2[]): boolean {
        if (letterCoords.length === 1) {
            if (
                this.infoClientService.game.board[letterCoords[0].y][letterCoords[0].x - 1].letter.value !== '' ||
                this.infoClientService.game.board[letterCoords[0].y][letterCoords[0].x + 1].letter.value !== ''
            ) {
                return false;
            } else if (
                this.infoClientService.game.board[letterCoords[0].y - 1][letterCoords[0].x].letter.value !== '' ||
                this.infoClientService.game.board[letterCoords[0].y + 1][letterCoords[0].x].letter.value !== ''
            ) {
                return true;
            } else {
                // eslint-disable-next-line no-console
                console.log('Error1 in PlaceGraphic::isWordVertical');
            }
        } else if (letterCoords.length > 1) {
            if (letterCoords[0].x === letterCoords[1].x) {
                return true;
            } else {
                return false;
            }
        } else {
            // eslint-disable-next-line no-console
            console.log('Error2 in PlaceGraphic::isWordVertical');
        }
        return false;
    }

    private deleteLetterPlacedOnBoard(game: GameServer, socket: Socket) {
        if (this.drawingBoardService.lettersDrawn === '') {
            return;
        }
        if (this.drawingBoardService.isArrowVertical) {
            if (this.drawingBoardService.arrowPosY <= Constants.NUMBER_SQUARE_H_AND_W) {
                // delete the arrow
                socket.emit('clearTmpTileCanvas');
            }
            // the arrow move one case back
            this.drawingBoardService.arrowPosY -= 1;
            // check if the arrow is on a old letter
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.arrowPosY -= 1;
            }

            // remove precedent letter
            socket.emit('rmTempLetterBoard', {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        } else {
            if (this.drawingBoardService.arrowPosX <= Constants.NUMBER_SQUARE_H_AND_W) {
                // delete the arrow
                socket.emit('clearTmpTileCanvas');
            }

            // the arrow move one case back
            this.drawingBoardService.arrowPosX -= 1;
            // check if the arrow is on a old letter
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.arrowPosX -= 1;
            }

            // remove precedent letter
            socket.emit('rmTempLetterBoard', {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        }
        let letterTofind: string = this.drawingBoardService.lettersDrawn[this.drawingBoardService.lettersDrawn.length - 1];
        if (letterTofind.toUpperCase() === letterTofind) {
            letterTofind = '*';
        }

        // add the letter to the stand logically and visually
        socket.emit('addTileToStand', letterTofind);

        this.drawingBoardService.lettersDrawn = this.drawingBoardService.lettersDrawn.substr(0, this.drawingBoardService.lettersDrawn.length - 1);
        this.drawingBoardService.coordsLettersDrawn.pop();

        if (this.drawingBoardService.isArrowVertical) {
            if (this.drawingBoardService.lettersDrawn === '') {
                this.drawingBoardService.isArrowPlaced = false;
                this.drawingBoardService.arrowPosX = Constants.NUMBER_SQUARE_H_AND_W + 1;
                this.drawingBoardService.arrowPosY = Constants.NUMBER_SQUARE_H_AND_W + 1;
                return;
            }
            socket.emit('drawVerticalArrow', {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        } else {
            if (this.drawingBoardService.lettersDrawn === '') {
                this.drawingBoardService.isArrowPlaced = false;
                this.drawingBoardService.arrowPosX = Constants.NUMBER_SQUARE_H_AND_W + 1;
                this.drawingBoardService.arrowPosY = Constants.NUMBER_SQUARE_H_AND_W + 1;
                return;
            }
            socket.emit('drawHorizontalArrow', {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        }
    }

    private drawContinuousArrow(game: GameServer, keyEntered: string, socket: Socket) {
        this.drawingBoardService.lettersDrawn += keyEntered;
        this.drawingBoardService.coordsLettersDrawn.push({ x: this.drawingBoardService.arrowPosX, y: this.drawingBoardService.arrowPosY });
        if (this.drawingBoardService.isArrowVertical) {
            this.drawingBoardService.arrowPosY += 1;
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.arrowPosY += 1;
            }
        } else {
            this.drawingBoardService.arrowPosX += 1;
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.arrowPosX += 1;
            }
        }
        if (
            this.drawingBoardService.arrowPosY > Constants.NUMBER_SQUARE_H_AND_W ||
            this.drawingBoardService.arrowPosX > Constants.NUMBER_SQUARE_H_AND_W
        ) {
            // delete the arrow
            socket.emit('clearTmpTileCanvas');
            this.drawingBoardService.isArrowPlaced = false;
            return;
        }
        if (this.drawingBoardService.isArrowVertical) {
            socket.emit('drawVerticalArrow', {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        } else {
            socket.emit('drawHorizontalArrow', {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        }
    }

    private findIndexLetterInStandForPlacement(letterToSearch: string, onBoard: boolean, player: Player): number {
        const indexLetterToSearch = Constants.DEFAULT_VALUE_NUMBER;
        for (let i = 0; i < player.stand.length; i++) {
            if (player.stand[i].letter.value === letterToSearch && player.stand[i].isOnBoard === onBoard) {
                player.stand[i].isOnBoard = !onBoard;
                return i;
            }
        }
        return indexLetterToSearch;
    }
}
