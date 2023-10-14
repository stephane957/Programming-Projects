import { Injectable } from '@angular/core';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';
import { DrawingBoardService } from './drawing-board-service';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';

@Injectable({
    providedIn: 'root',
})
export class MouseKeyboardEventHandlerService {
    isCommunicationBoxFocus: boolean;
    private isStandClicked: boolean;
    private isCommBoxJustBeenClicked: boolean;

    constructor(
        private drawingBoardService: DrawingBoardService,
        private socketService: SocketService,
        private placeGraphicService: PlaceGraphicService,
        private infoClientService: InfoClientService,
        private drawingService: DrawingService,
    ) {
        this.initDefaultVariables();
    }

    initDefaultVariables() {
        this.isCommunicationBoxFocus = false;
        this.isStandClicked = false;
        this.isCommBoxJustBeenClicked = false;
    }

    onMouseDownGetStandTile(event: MouseEvent): Tile {
        this.placeGraphicService.tileClickedFromStand = true;
        return this.placeGraphicService.getClikedStandTile(event.offsetX);
    }

    onMouseDownGetBoardTile(event: MouseEvent): Tile | undefined {
        this.placeGraphicService.tileClickedFromStand = false;
        return this.placeGraphicService.getClikedBoardTile({ x: event.offsetX, y: event.offsetY });
    }

    // function that get the index of a pixel position mouse up
    // and send ask the server to place the tile as a temporary one
    onStandToBoardDrop(coordsClick: Vec2, tileDropped: Tile, letterChoice: string) {
        // indexs of the tile where the "tileDropped" has been dropped
        const posDropBoardIdxs: Vec2 = this.drawingBoardService.getIndexOnBoardLogicFromClick(coordsClick);
        // if the tile on which we drop the new one is an old one (from a precedent turn)
        // we do nothing
        if (this.infoClientService.game?.board[posDropBoardIdxs.y][posDropBoardIdxs.x].letter.value !== '') {
            return;
        }

        if (this.drawingBoardService.lettersDrawn === '') {
            this.drawingBoardService.isArrowPlaced = false;
            this.placeGraphicService.placeMethodIsDragDrop = true;
            this.placeGraphicService.startLettersPlacedPosX = posDropBoardIdxs.x;
            this.placeGraphicService.startLettersPlacedPosY = posDropBoardIdxs.y;
        }

        // remove the tile from the stand logically and visually
        this.socketService.socket.emit('rmTileFromStand', tileDropped);

        // check if the tile is a special tile (star or not)
        if (letterChoice !== '') {
            this.drawingBoardService.lettersDrawn += letterChoice.toLowerCase();
            this.socketService.socket.emit('addTempLetterBoard', letterChoice.toLowerCase(), posDropBoardIdxs.x, posDropBoardIdxs.y);
        } else {
            this.drawingBoardService.lettersDrawn += tileDropped.letter.value;
            this.socketService.socket.emit('addTempLetterBoard', tileDropped.letter.value, posDropBoardIdxs.x, posDropBoardIdxs.y);
        }
        this.drawingBoardService.coordsLettersDrawn.push(posDropBoardIdxs);
    }

    onBoardToBoardDrop(coordsClick: Vec2, tileDropped: Tile) {
        // indexs of the tile where the "tileDropped" has been dropped
        const posDropBoardIdxs: Vec2 = this.drawingBoardService.getIndexOnBoardLogicFromClick(coordsClick);

        // if the tile on which we drop the new one has a letter already on it we do nothing
        if (this.infoClientService.game?.board[posDropBoardIdxs.y][posDropBoardIdxs.x].letter.value !== '') {
            return;
        }

        // indexs of the "tileDropped" variable on the board
        const posClickedTileIdxs: Vec2 = this.drawingBoardService.getIndexOnBoardLogicFromClick({
            x: tileDropped.position.x1,
            y: tileDropped.position.y1,
        });

        // changes the coords in the drawingBoardService.coordsLettersDrawn array to set the new position
        this.changeCoordsLettersDrawn(posClickedTileIdxs, posDropBoardIdxs);

        // if there is only one letter on the board we want to reassign the start position
        if (this.drawingBoardService.lettersDrawn.length === 1) {
            this.placeGraphicService.startLettersPlacedPosX = posDropBoardIdxs.x;
            this.placeGraphicService.startLettersPlacedPosY = posDropBoardIdxs.y;
        }

        // if the tile on which we drop the new one is the same tile we do nothing
        if (posClickedTileIdxs.x === posDropBoardIdxs.x && posClickedTileIdxs.y === posDropBoardIdxs.y) {
            return;
        }
        // ask for update board logic for a move of temporary tile
        this.socketService.socket.emit('onBoardToBoardDrop', posClickedTileIdxs, posDropBoardIdxs);
    }

    // function that changes the coords drawingBoardService.coordsLettersDrawn array to set the new position
    changeCoordsLettersDrawn(oldPosIdxs: Vec2, newPosIdx: Vec2) {
        for (const coord of this.drawingBoardService.coordsLettersDrawn) {
            if (coord.x === oldPosIdxs.x && coord.y === oldPosIdxs.y) {
                coord.x = newPosIdx.x;
                coord.y = newPosIdx.y;
                return;
            }
        }
    }

    onBoardToStandDrop(coordsClick: Vec2, tileDropped: Tile, originalClickTileIndexs: Vec2) {
        // if the letter taken from the board isn't one taken from the stand
        // we do nothing
        if (!this.drawingBoardService.lettersDrawn.includes(tileDropped.letter.value)) {
            return;
        }

        // gets the index of the letterDrawn array to remove
        const idxToRm = this.checkIdxToRm(originalClickTileIndexs);
        // remove the letter from the lettersDrawn array
        this.drawingBoardService.lettersDrawn =
            this.drawingBoardService.lettersDrawn.slice(0, idxToRm) +
            this.drawingBoardService.lettersDrawn.slice(idxToRm + 1, this.drawingBoardService.lettersDrawn.length);
        this.drawingBoardService.coordsLettersDrawn.splice(idxToRm, 1);

        const standIdx: number = this.drawingService.getIndexOnStandLogicFromClick(coordsClick.x);
        // indexs of the "tileDropped" variable on the board
        const tileDroppedIdxs: Vec2 = this.drawingBoardService.getIndexOnBoardLogicFromClick({
            x: tileDropped.position.x1,
            y: tileDropped.position.y1,
        });
        this.socketService.socket.emit('clearTmpTileCanvas');
        this.socketService.socket.emit('onBoardToStandDrop', tileDroppedIdxs, tileDropped.letter.value, standIdx);
    }

    onLeftClickStand(event: MouseEvent) {
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        this.isStandClicked = true;
        this.isCommBoxJustBeenClicked = false;

        event.preventDefault();
        const coordinateXClick: number = event.offsetX;
        if (this.drawingBoardService.lettersDrawn) {
            return;
        }
        this.socketService.socket.emit('leftClickSelection', coordinateXClick);
    }

    onRightClickStand(event: MouseEvent) {
        this.isCommBoxJustBeenClicked = false;
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        event.preventDefault();
        const coordinateXClick: number = event.offsetX;
        if (this.drawingBoardService.lettersDrawn) {
            return;
        }
        this.socketService.socket.emit('rightClickExchange', coordinateXClick);
    }

    onBoardClick(event: MouseEvent) {
        this.isCommBoxJustBeenClicked = false;
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        event.preventDefault();
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };

        if (this.drawingBoardService.lettersDrawn === '') {
            this.placeGraphicService.placeMethodIsDragDrop = false;
        }

        if (this.infoClientService.isTurnOurs && this.placeGraphicService.isArrowsEnabled()) {
            if (this.drawingBoardService.lettersDrawn) {
                return;
            }
            this.drawingBoardService.findTileToPlaceArrow(this.socketService.socket, coordsClick, this.infoClientService.game.board);
        }
    }

    onCommunicationBoxEnter(msg: string, actualChatRoomName: string) {
        if (actualChatRoomName === 'game') {
            this.socketService.socket.emit('newMessageClient', msg);
        } else {
            this.socketService.socket.emit('addMsgToChatRoom', actualChatRoomName, msg);
        }
        this.isCommBoxJustBeenClicked = false;
        this.isCommunicationBoxFocus = true;
    }

    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.isCommunicationBoxFocus || !this.infoClientService.game?.gameStarted) {
            return;
        }
        if (this.drawingBoardService.isArrowPlaced || this.drawingBoardService.lettersDrawn) {
            this.placeGraphicService.manageKeyboardEvent(
                this.infoClientService.game,
                this.infoClientService.player,
                event.key,
                this.socketService.socket,
            );
            return;
        }
        const eventString: string = event.key.toString();
        this.socketService.socket.emit('keyboardSelection', eventString);
    }

    handleArrowEvent(event: KeyboardEvent) {
        if (this.isCommunicationBoxFocus || !this.infoClientService.game?.gameStarted) {
            return;
        }

        const eventString: string = event.key.toString();
        this.socketService.socket.emit('keyboardAndMouseManipulation', eventString);
    }

    handleScrollEvent(event: WheelEvent) {
        if (this.isCommunicationBoxFocus || !this.infoClientService.game?.gameStarted) {
            return;
        }

        const eventString: string = event.deltaY.toString();
        this.socketService.socket.emit('keyboardAndMouseManipulation', eventString);
    }

    onLeftClickGamePage() {
        if (!this.isCommBoxJustBeenClicked) {
            this.isCommunicationBoxFocus = false;
        }
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        this.isCommBoxJustBeenClicked = false;
        if (!this.isStandClicked) {
            if (this.drawingBoardService.lettersDrawn !== '') {
                return;
            }
            // this.socketService.socket.emit('resetAllTilesStand');
        } else {
            this.isStandClicked = !this.isStandClicked;
        }
        this.isCommBoxJustBeenClicked = false;
    }

    onCommunicationBoxLeftClick() {
        this.isCommBoxJustBeenClicked = true;
        this.isCommunicationBoxFocus = true;
    }

    // function to check which letter to remove from the lettersDrawn array
    // in this function, one of the two diff or both will be 0 bc one axis doesn't change
    // the other axis that changes is the one that interest us bc it's the one that
    // give the index of the letter in the lettersDrawn array to remove
    private checkIdxToRm(originalClickTileIndexs: Vec2) {
        const xDiff = originalClickTileIndexs.x - this.placeGraphicService.startLettersPlacedPosX;
        const yDiff = originalClickTileIndexs.y - this.placeGraphicService.startLettersPlacedPosY;
        return xDiff > yDiff ? xDiff : yDiff;
    }
}
