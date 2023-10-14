import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
import { LetterBankService } from './letter-bank.service';
import { PlayAreaService } from './play-area.service';
import { StandService } from './stand.service';

@Service()
export class MouseEventService {
    sio: io.Server;
    constructor(
        private standService: StandService,
        private boardService: BoardService,
        private chatService: ChatService,
        private playAreaService: PlayAreaService,
        private letterBankService: LetterBankService,
    ) {
        this.sio = new io.Server();
    }

    initSioMouseEvent(sio: io.Server) {
        this.sio = sio;
    }

    rightClickExchange(player: Player, positionX: number): void {
        const tilePos: number = this.tileClickedPosition(positionX);
        if (tilePos >= Constants.NUMBER_SLOT_STAND || tilePos < 0) {
            return;
        }
        if (player.stand[tilePos].backgroundColor === '#ff6600') {
            return;
        }
        if (player.stand[tilePos].backgroundColor === '#F7F7E3') {
            player.stand[tilePos].backgroundColor = '#AEB1D9';
        } else {
            this.resetTileStandAtPos(player, tilePos);
        }

        this.sendStandToClient(player);
    }

    leftClickSelection(player: Player, positionX: number): void {
        const invalidIndex = -1;
        const tilePos: number = this.tileClickedPosition(positionX);
        if (tilePos >= Constants.NUMBER_SLOT_STAND || tilePos < 0) {
            return;
        }
        if (player.stand[tilePos].backgroundColor === '#AEB1D9') {
            return;
        }
        if (player.tileIndexManipulation !== invalidIndex) {
            player.stand[player.tileIndexManipulation].backgroundColor = '#F7F7E3';
        }
        player.tileIndexManipulation = tilePos;
        player.stand[tilePos].backgroundColor = '#ff6600';
        this.sendStandToClient(player);
    }

    keyboardSelection(player: Player, eventString: string) {
        if (!player.mapLetterOnStand.has(eventString)) {
            if (player.tileIndexManipulation !== Constants.DEFAULT_VALUE_NUMBER) {
                player.stand[player.tileIndexManipulation].backgroundColor = '#F7F7E3';
            }
        } else {
            const oldTileIndex = player.tileIndexManipulation;
            let newIndex = this.standService.findIndexLetterInStand(eventString, oldTileIndex + 1, player);
            if (player.mapLetterOnStand.get(eventString).value > 1) {
                while (newIndex === oldTileIndex) {
                    newIndex = this.standService.findIndexLetterInStand(eventString, newIndex + 1, player);
                }
            }
            player.tileIndexManipulation = newIndex;
            this.drawChangeSelection(player, player.tileIndexManipulation, oldTileIndex);
        }
    }

    keyboardAndMouseManipulation(game: GameServer, player: Player, eventString: string) {
        if (player.tileIndexManipulation === Constants.DEFAULT_VALUE_NUMBER) {
            return;
        }
        let indexTileChanged = Constants.DEFAULT_VALUE_NUMBER;
        let conditionCheck;
        const maxIndexStand = 6;
        // keyup is the type of KeyboardEvent
        if (eventString[0] === 'A') {
            conditionCheck = () => {
                return eventString === 'ArrowLeft';
            };
        } else {
            conditionCheck = () => {
                return eventString[0] !== '-';
            };
        }
        if (conditionCheck()) {
            indexTileChanged = player.tileIndexManipulation - 1;
            if (player.tileIndexManipulation === 0) {
                indexTileChanged = maxIndexStand;
            }
        } else {
            indexTileChanged = player.tileIndexManipulation + 1;
            if (player.tileIndexManipulation === maxIndexStand) {
                indexTileChanged = 0;
            }
        }
        this.doTheManipulation(game, player, indexTileChanged);
    }

    async exchangeButtonClicked(game: GameServer, player: Player): Promise<void> {
        const exchangeCmd: string = this.createExchangeCmd(player);
        const response: boolean = (await this.chatService.sendMessage(exchangeCmd, game, player)) as boolean;
        if (response) {
            for (let i = 0; i < Constants.NUMBER_SLOT_STAND; i++) {
                if (player.stand[i].backgroundColor === '#AEB1D9') {
                    this.standService.updateStandAfterExchangeWithPos(i, player, game.letters, game.letterBank);
                }
            }
        }
        this.resetExchangeTiles(player);
        this.sendStandToClient(player);
        this.playAreaService.changePlayer(game);
    }

    cancelButtonClicked(player: Player): void {
        this.resetAllTilesStand(player);
        this.sendStandToClient(player);
    }

    resetAllTilesStand(player: Player) {
        for (let i = 0; i < Constants.NUMBER_SLOT_STAND; i++) {
            this.resetTileStandAtPos(player, i);
        }
        this.sendStandToClient(player);
    }

    boardClick(player: Player): void {
        this.resetAllTilesStand(player);
    }

    addTempLetterBoard(game: GameServer, keyEntered: string, xIndex: number, yIndex: number) {
        game.board[yIndex][xIndex].letter.value = keyEntered;
        game.board[yIndex][xIndex].letter.weight = this.letterBankService.getLetterWeight(keyEntered, game.letterBank);
        game.board[yIndex][xIndex].borderColor = '#ffaaff';
    }

    rmTempLetterBoard(game: GameServer, idxsTileToRm: Vec2) {
        game.board[idxsTileToRm.y][idxsTileToRm.x].letter.value = '';
        game.board[idxsTileToRm.y][idxsTileToRm.x].letter.weight = 0;
        game.board[idxsTileToRm.y][idxsTileToRm.x].borderColor = '#212121';
    }

    rmTileFromStand(player: Player, tileToRm: Tile) {
        for (let i = 0; i < player.stand.length; i++) {
            if (player.stand[i].position.x1 !== tileToRm.position.x1) {
                continue;
            }
            this.standService.deleteLetterStandLogic(tileToRm.letter.value, i, player);
            break;
        }
    }

    addTileToStand(game: GameServer, player: Player, letterToAdd: string) {
        this.standService.putLettersOnStand(game, letterToAdd, player);
    }

    onBoardToStandDrop(tileDroppedIdxs: Vec2, letterDropped: string, standIdx: number, player: Player, game: GameServer) {
        // REMOVES LETTER FROM THE BOARD
        this.rmTempLetterBoard(game, tileDroppedIdxs);

        // PUTS LETTER ON THE STAND
        // if the tile on which we drop is empty we can drop the tile directly on it
        if (player.stand[standIdx].letter.value === '') {
            this.standService.writeLetterStandLogic(standIdx, letterDropped, game.letterBank, player);
        } else {
            // else we put the letter on any empty tile
            this.standService.putLettersOnStand(game, letterDropped, player);
        }
    }

    onBoardToBoardDrop(game: GameServer, posClickedTileIdxs: Vec2, posDropBoardIdxs: Vec2) {
        // set values of new tile
        const tileClicked = game.board[posClickedTileIdxs.y][posClickedTileIdxs.x];
        this.boardService.putLetterInBoardArray(tileClicked, posDropBoardIdxs, game);
        game.board[posDropBoardIdxs.y][posDropBoardIdxs.x].borderColor = '#ffaaff';
        // reset values of old tile
        game.board[posClickedTileIdxs.y][posClickedTileIdxs.x].borderColor = '#212121';
        game.board[posClickedTileIdxs.y][posClickedTileIdxs.x].letter.value = '';
        game.board[posClickedTileIdxs.y][posClickedTileIdxs.x].letter.weight = 0;
    }

    private drawChangeSelection(player: Player, newTileIndex: number, oldTileIndex: number) {
        if (newTileIndex !== Constants.DEFAULT_VALUE_NUMBER) {
            player.stand[newTileIndex].backgroundColor = '#ff6600';
        }
        if (oldTileIndex !== Constants.DEFAULT_VALUE_NUMBER && newTileIndex !== oldTileIndex) {
            player.stand[oldTileIndex].backgroundColor = '#F7F7E3';
        }
        this.sendStandToClient(player);
    }
    private tileClickedPosition(positionX: number): number {
        const constPosXYForStands =
            Constants.PADDING_BOARD_FOR_STANDS +
            Constants.DEFAULT_WIDTH_BOARD / 2 -
            Constants.DEFAULT_WIDTH_STAND / 2 +
            Constants.SIZE_OUTER_BORDER_STAND;
        const posXCleaned = positionX - constPosXYForStands;
        return Math.floor(Constants.DEFAULT_NB_LETTER_STAND / (Constants.DEFAULT_WIDTH_STAND / posXCleaned));
    }

    private doTheManipulation(game: GameServer, player: Player, indexTileChanged: number) {
        this.handleLogicManipulation(game, player, indexTileChanged);
        this.handleViewManipulation(indexTileChanged, player);
        player.tileIndexManipulation = indexTileChanged;
        this.sendStandToClient(player);
    }

    private handleViewManipulation(indexTileChanged: number, player: Player) {
        player.stand[indexTileChanged].backgroundColor = '#ff6600';
        player.stand[player.tileIndexManipulation].backgroundColor = '#F7F7E3';
    }

    private handleLogicManipulation(game: GameServer, player: Player, indexTileChanged: number) {
        // we save the letter to the left
        const oldLetter = player.stand[indexTileChanged].letter.value;

        // we change the letter to the left for the one to the rigth
        this.standService.writeLetterArrayLogic(indexTileChanged, player.stand[player.tileIndexManipulation].letter.value, game.letterBank, player);

        // we write the letter to the right for the one to the left
        this.standService.writeLetterArrayLogic(player.tileIndexManipulation, oldLetter, game.letterBank, player);
    }

    private createExchangeCmd(player: Player): string {
        let exchangeCmd = '!échanger ';
        for (const tile of player.stand) {
            if (tile.backgroundColor === '#AEB1D9') {
                exchangeCmd = exchangeCmd + tile.letter.value;
            }
        }
        return exchangeCmd;
    }

    private resetExchangeTiles(player: Player) {
        for (let i = 0; i < player.stand.length; i++) {
            if (player.stand[i].backgroundColor === '#AEB1D9') {
                this.resetTileStandAtPos(player, i);
            }
        }
    }

    private resetTileStandAtPos(player: Player, position: number) {
        if (!player.stand[position]) {
            // eslint-disable-next-line no-console
            console.log('Bug in MouseEventService:resetTileStandAtPos. Position is: ' + position);
            // eslint-disable-next-line no-console
            console.log('Player.stand is: ' + player.stand);
            return;
        }
        player.stand[position].backgroundColor = '#F7F7E3';
    }

    private sendStandToClient(player: Player) {
        this.sio.sockets.sockets.get(player.id)?.emit('playerAndStandUpdate', player);
    }
}
