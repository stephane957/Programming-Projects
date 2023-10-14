import { Injectable } from '@angular/core';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { DrawingBoardService } from './drawing-board-service';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';
import { SocketService } from './socket.service';
const DEFAULT_VALUE_INDEX = -1;

@Injectable({
    providedIn: 'root',
})
export class PlaceGraphicService {
    private startLettersPlacedPosX: number;
    private startLettersPlacedPosY: number;

    constructor(
        private drawingBoardService: DrawingBoardService,
        private socketService: SocketService,
        private drawingService: DrawingService,
        private infoClientService: InfoClientService,
    ) {
        this.startLettersPlacedPosX = 0;
        this.startLettersPlacedPosY = 0;
    }

    manageKeyBoardEvent(game: GameServer, player: Player, keyEntered: string) {
        if (this.infoClientService.displayTurn !== "C'est votre tour !") {
            return;
        }
        keyEntered = keyEntered.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        switch (keyEntered) {
            case 'Enter': {
                if (!this.drawingBoardService.lettersDrawn) {
                    return;
                }
                const placeMsg: string = this.createPlaceMessage();
                this.socketService.socket.emit('newMessageClient', placeMsg);
                this.deleteEveryLetterPlacedOnBoard(game, player);
                this.drawingBoardService.isArrowPlaced = false;
                return;
            }
            case 'Backspace': {
                if (!this.drawingBoardService.lettersDrawn) {
                    return;
                }
                this.deleteLetterPlacedOnBoard(game, player);
                this.drawingBoardService.isArrowPlaced = this.drawingBoardService.lettersDrawn.length !== 0;
                return;
            }
            case 'Escape': {
                if (!this.drawingBoardService.lettersDrawn) {
                    return;
                }
                this.deleteEveryLetterPlacedOnBoard(game, player);
                this.drawingBoardService.isArrowPlaced = false;
                break;
            }
        }
        if (
            this.drawingBoardService.arrowPosX > GlobalConstants.NUMBER_SQUARE_H_AND_W ||
            this.drawingBoardService.arrowPosY > GlobalConstants.NUMBER_SQUARE_H_AND_W
        ) {
            return;
        }
        if (!this.drawingBoardService.lettersDrawn) {
            this.startLettersPlacedPosX = this.drawingBoardService.arrowPosX;
            this.startLettersPlacedPosY = this.drawingBoardService.arrowPosY;
        }
        if (keyEntered.toUpperCase() === keyEntered) {
            // if the keyEntered is in capital we treat it as the *
            this.placeUpperCaseLetter(game, player, keyEntered); // tested
            return;
        }
        const letterPos: number = this.findIndexLetterInStandForPlacement(keyEntered, false, player);
        if (letterPos === DEFAULT_VALUE_INDEX) {
            return;
        }
        this.drawingService.removeTile(player.stand[letterPos]);
        this.keyEnteredKeyboard(game, keyEntered);
    }

    isLettersDrawnSizeAboveZero(): boolean {
        return this.drawingBoardService.lettersDrawn !== '';
    }

    private createPlaceMessage(): string {
        const posStartWordX: number = this.startLettersPlacedPosX;
        let posStartWordY: number = this.startLettersPlacedPosY;
        posStartWordY += GlobalConstants.ASCII_CODE_SHIFT;
        let placerCmd = '!placer ' + String.fromCodePoint(posStartWordY) + posStartWordX.toString();
        if (this.drawingBoardService.isArrowVertical) {
            placerCmd += 'v ' + this.drawingBoardService.lettersDrawn;
        } else {
            placerCmd += 'h ' + this.drawingBoardService.lettersDrawn;
        }
        return placerCmd;
    }

    private placeUpperCaseLetter(game: GameServer, player: Player, keyEntered: string) {
        const letterPos: number = this.findIndexLetterInStand('*', 0, player);
        if (letterPos === DEFAULT_VALUE_INDEX || letterPos === undefined) {
            return;
        }
        if (
            this.drawingBoardService.arrowPosY > GlobalConstants.NUMBER_SQUARE_H_AND_W ||
            this.drawingBoardService.arrowPosX > GlobalConstants.NUMBER_SQUARE_H_AND_W
        ) {
            return;
        }
        this.drawingService.removeTile(this.infoClientService.player.stand[letterPos]);
        this.keyEnteredKeyboard(game, keyEntered);
    }

    private deleteEveryLetterPlacedOnBoard(game: GameServer, player: Player) {
        if (!this.drawingBoardService.lettersDrawn) {
            return;
        }
        const letterDrawnLength: number = this.drawingBoardService.lettersDrawn.length;
        for (let i = 0; i < letterDrawnLength; i++) {
            this.deleteLetterPlacedOnBoard(game, player);
        }
        this.drawingBoardService.isArrowVertical = true;
        this.drawingBoardService.lettersDrawn = '';
    }

    private deleteLetterPlacedOnBoard(game: GameServer, player: Player) {
        if (this.drawingBoardService.lettersDrawn === '') {
            return;
        }
        this.checkIfThereAreLettersBefore(game, false);
        if (this.drawingBoardService.isArrowVertical) {
            if (this.drawingBoardService.arrowPosY <= GlobalConstants.NUMBER_SQUARE_H_AND_W) {
                this.drawingBoardService.drawTileAtPos(
                    this.drawingBoardService.arrowPosX - 1,
                    game.bonusBoard,
                    this.drawingBoardService.arrowPosY - 1,
                    1,
                ); // erase arrow
            }
            while (game.board[this.drawingBoardService.arrowPosY - 1][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.arrowPosY -= 1;
            }

            this.drawingBoardService.removeTile(game.board[this.drawingBoardService.arrowPosY - 1][this.drawingBoardService.arrowPosX]);

            this.drawingBoardService.drawTileAtPos(
                this.drawingBoardService.arrowPosX - 1,
                game.bonusBoard,
                this.drawingBoardService.arrowPosY - 2,
                1,
            ); // erase tile
        } else {
            if (this.drawingBoardService.arrowPosX <= GlobalConstants.NUMBER_SQUARE_H_AND_W) {
                this.drawingBoardService.drawTileAtPos(
                    this.drawingBoardService.arrowPosX - 1,
                    game.bonusBoard,
                    this.drawingBoardService.arrowPosY - 1,
                    1,
                );
            }
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX - 1].old) {
                this.drawingBoardService.arrowPosX -= 1;
            }
            this.drawingBoardService.removeTile(game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX - 1]);
            this.drawingBoardService.drawTileAtPos(
                this.drawingBoardService.arrowPosX - 2,
                game.bonusBoard,
                this.drawingBoardService.arrowPosY - 1,
                1,
            );
        }
        let letterTofind: string = this.drawingBoardService.lettersDrawn[this.drawingBoardService.lettersDrawn.length - 1];
        if (letterTofind.toUpperCase() === letterTofind) {
            letterTofind = '*';
        }
        const letterPos = this.findIndexLetterInStandForPlacement(letterTofind, true, player);
        if (letterPos !== GlobalConstants.DEFAULT_VALUE_NUMBER) {
            this.drawingService.drawOneLetter(
                letterTofind,
                player.stand[letterPos],
                this.drawingService.canvasStand,
                this.infoClientService.letterBank,
            );
        }
        this.drawingBoardService.lettersDrawn = this.drawingBoardService.lettersDrawn.substr(0, this.drawingBoardService.lettersDrawn.length - 1);
        if (this.drawingBoardService.isArrowVertical) {
            if (this.drawingBoardService.arrowPosY === this.startLettersPlacedPosY || this.areAllLettersBeforeOld(game)) {
                this.drawingBoardService.isArrowVertical = true;
                this.drawingBoardService.lettersDrawn = '';
                this.drawingBoardService.arrowPosX = GlobalConstants.NUMBER_SQUARE_H_AND_W + 1;
                this.drawingBoardService.arrowPosY = GlobalConstants.NUMBER_SQUARE_H_AND_W + 1;
                return;
            }
            this.drawingBoardService.drawVerticalArrowDirection(this.drawingBoardService.arrowPosX, this.drawingBoardService.arrowPosY - 1);
        } else {
            if (this.drawingBoardService.arrowPosX === this.startLettersPlacedPosX || this.areAllLettersBeforeOld(game)) {
                this.drawingBoardService.isArrowVertical = true;
                this.drawingBoardService.lettersDrawn = '';
                this.drawingBoardService.arrowPosX = GlobalConstants.NUMBER_SQUARE_H_AND_W + 1;
                this.drawingBoardService.arrowPosY = GlobalConstants.NUMBER_SQUARE_H_AND_W + 1;
                return;
            }
            this.drawingBoardService.drawHorizontalArrowDirection(this.drawingBoardService.arrowPosX - 1, this.drawingBoardService.arrowPosY);
        }
    }

    private keyEnteredKeyboard(game: GameServer, keyEntered: string) {
        if (!this.drawingBoardService.lettersDrawn) {
            this.checkIfThereAreLettersBefore(game, true);
        }
        this.drawingBoardService.lettersDrawn += keyEntered;
        let letterTodrawPosX = 0;
        let letterTodrawPosY = 0;
        letterTodrawPosX = this.drawingBoardService.arrowPosY;
        letterTodrawPosY = this.drawingBoardService.arrowPosX;
        if (this.drawingBoardService.isArrowVertical) {
            this.drawingBoardService.arrowPosY += 1;
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.lettersDrawn +=
                    game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].letter.value;
                this.drawingBoardService.arrowPosY += 1;
            }
        } else {
            this.drawingBoardService.arrowPosX += 1;
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.lettersDrawn +=
                    game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].letter.value;
                this.drawingBoardService.arrowPosX += 1;
            }
        }

        this.drawingService.drawOneLetter(
            keyEntered,
            game.board[letterTodrawPosX][letterTodrawPosY],
            this.drawingBoardService.boardCanvas,
            this.infoClientService.letterBank,
            '',
            '#ffaaff',
        );
        const outOfBoardPos = 16;
        if (this.drawingBoardService.arrowPosY >= outOfBoardPos || this.drawingBoardService.arrowPosX >= outOfBoardPos) {
            return;
        }
        if (this.drawingBoardService.isArrowVertical) {
            this.drawingBoardService.drawVerticalArrowDirection(this.drawingBoardService.arrowPosX, this.drawingBoardService.arrowPosY);
        } else {
            this.drawingBoardService.drawHorizontalArrowDirection(this.drawingBoardService.arrowPosX, this.drawingBoardService.arrowPosY);
        }
    }

    private checkIfThereAreLettersBefore(game: GameServer, addToLetterDrawn: boolean) {
        let tmpArrowPosY: number = this.drawingBoardService.arrowPosY;
        let tmpArrowPosX: number = this.drawingBoardService.arrowPosX;
        let tmpLettersFoundBefore = '';
        if (this.drawingBoardService.isArrowVertical) {
            while (game.board[tmpArrowPosY - 1][tmpArrowPosX].old) {
                if (addToLetterDrawn) {
                    tmpLettersFoundBefore += game.board[tmpArrowPosY - 1][tmpArrowPosX].letter.value;
                } else {
                    this.drawingBoardService.lettersDrawn = this.drawingBoardService.lettersDrawn.substr(
                        0,
                        this.drawingBoardService.lettersDrawn.length - 1,
                    );
                }
                tmpArrowPosY -= 1;
                this.startLettersPlacedPosX = tmpArrowPosX;
                this.startLettersPlacedPosY = tmpArrowPosY;
            }
        } else {
            while (game.board[tmpArrowPosY][tmpArrowPosX - 1].old) {
                if (addToLetterDrawn) {
                    tmpLettersFoundBefore += game.board[tmpArrowPosY][tmpArrowPosX - 1].letter.value;
                } else {
                    this.drawingBoardService.lettersDrawn = this.drawingBoardService.lettersDrawn.substr(
                        0,
                        this.drawingBoardService.lettersDrawn.length - 1,
                    );
                }
                tmpArrowPosX -= 1;
                this.startLettersPlacedPosX = tmpArrowPosX;
                this.startLettersPlacedPosY = tmpArrowPosY;
            }
        }
        if (addToLetterDrawn && tmpLettersFoundBefore) {
            for (let i = 0; i < tmpLettersFoundBefore.length; i++) {
                this.drawingBoardService.lettersDrawn += tmpLettersFoundBefore[tmpLettersFoundBefore.length - 1 - i];
            }
        }
    }

    private findIndexLetterInStand(letterToSearch: string, startIndex: number, player: Player): number {
        const indexLetterToSearch = -1;
        for (let i = startIndex; i < player.stand.length; i++) {
            if (player.stand[i].letter.value === letterToSearch) {
                return i;
            }
        }
        for (let i = 0; i < startIndex; i++) {
            if (player.stand[i].letter.value === letterToSearch) {
                return i;
            }
        }
        return indexLetterToSearch;
    }

    private findIndexLetterInStandForPlacement(letterToSearch: string, onBoard: boolean, player: Player): number {
        const indexLetterToSearch = -1;
        for (let i = 0; i < player.stand.length; i++) {
            if (player.stand[i].letter.value === letterToSearch && player.stand[i].isOnBoard === onBoard) {
                player.stand[i].isOnBoard = !onBoard;
                return i;
            }
        }
        return indexLetterToSearch;
    }

    private areAllLettersBeforeOld(game: GameServer): boolean {
        let tmpArrowPosY: number = this.drawingBoardService.arrowPosY;
        let tmpArrowPosX: number = this.drawingBoardService.arrowPosX;
        let tmpLettersDrawn: string = this.drawingBoardService.lettersDrawn;
        if (this.drawingBoardService.isArrowVertical) {
            while (game.board[tmpArrowPosY - 2][tmpArrowPosX].old) {
                tmpArrowPosY -= 1;
                tmpLettersDrawn = tmpLettersDrawn.substr(0, tmpLettersDrawn.length - 1);
            }
            return tmpLettersDrawn === '';
        } else {
            while (game.board[tmpArrowPosY][tmpArrowPosX - 2].old) {
                tmpArrowPosX -= 1;
                tmpLettersDrawn = tmpLettersDrawn.substr(0, tmpLettersDrawn.length - 1);
            }
            return tmpLettersDrawn === '';
        }
    }
}
