import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { Vec2 } from '@app/classes/vec2';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { ChatService } from './chat.service';
import { ObjectiveService } from './objective.service';
import { PlayAreaService } from './play-area.service';
import { StandService } from './stand.service';

@Service()
export class MouseEventService {
    sio: io.Server;
    constructor(
        private standService: StandService,
        private chatService: ChatService,
        private playAreaService: PlayAreaService,
        private objectiveService: ObjectiveService,
    ) {
        this.sio = new io.Server();
    }

    initSioMouseEvent(sio: io.Server) {
        this.sio = sio;
    }

    rightClickExchange(player: Player, positionX: number): void {
        const tilePos: number = this.tileClickedPosition(positionX);
        if (player.stand[tilePos].color === '#ff6600') {
            return;
        }
        if (tilePos < GlobalConstants.NUMBER_SLOT_STAND) {
            if (player.stand[tilePos].color === '#F7F7E3') {
                player.stand[tilePos].color = '#AEB1D9';
            } else {
                this.resetTileStandAtPos(player, tilePos);
            }
        }
        this.sendStandToClient(player);
    }

    leftClickSelection(player: Player, positionX: number): void {
        const invalidIndex = -1;
        const tilePos: number = this.tileClickedPosition(positionX);
        if (player.stand[tilePos].color === '#AEB1D9') {
            return;
        }
        if (player.tileIndexManipulation !== invalidIndex) {
            player.stand[player.tileIndexManipulation].color = '#F7F7E3';
        }
        player.tileIndexManipulation = tilePos;
        player.stand[tilePos].color = '#ff6600';
        this.sendStandToClient(player);
    }

    keyboardSelection(player: Player, eventString: string) {
        if (!player.mapLetterOnStand.has(eventString)) {
            if (player.tileIndexManipulation !== GlobalConstants.DEFAULT_VALUE_NUMBER) {
                player.stand[player.tileIndexManipulation].color = '#F7F7E3';
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
        if (player.tileIndexManipulation === GlobalConstants.DEFAULT_VALUE_NUMBER) {
            return;
        }
        let indexTileChanged = GlobalConstants.DEFAULT_VALUE_NUMBER;
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

    exchangeButtonClicked(game: GameServer, player: Player): void {
        const exchangeCmd: string = this.createExchangeCmd(player);
        this.chatService.sendMessage(exchangeCmd, game, player);
        for (let i = 0; i < GlobalConstants.NUMBER_SLOT_STAND; i++) {
            if (player.stand[i].color === '#AEB1D9') {
                this.standService.updateStandAfterExchangeWithPos(i, player, game.letters, game.letterBank);
            }
        }

        const playerThatJustPlayed = game.mapPlayers.get(game.currentPlayerId);
        if (playerThatJustPlayed && game.isLog2990Enabled) {
            this.objectiveService.isPlayerObjectivesCompleted(game, playerThatJustPlayed, exchangeCmd);
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
        for (let i = 0; i < GlobalConstants.NUMBER_SLOT_STAND; i++) {
            this.resetTileStandAtPos(player, i);
        }
        this.sendStandToClient(player);
    }

    boardClick(player: Player, position: Vec2): void {
        this.resetAllTilesStand(player);
        this.clickIsInBoard(player, position);
        this.sendStandToClient(player);
    }

    private drawChangeSelection(player: Player, newTileIndex: number, oldTileIndex: number) {
        if (newTileIndex !== GlobalConstants.DEFAULT_VALUE_NUMBER) {
            player.stand[newTileIndex].color = '#ff6600';
        }
        if (oldTileIndex !== GlobalConstants.DEFAULT_VALUE_NUMBER && newTileIndex !== oldTileIndex) {
            player.stand[oldTileIndex].color = '#F7F7E3';
        }
        this.sendStandToClient(player);
    }

    private tileClickedPosition(positionX: number): number {
        return Math.floor(GlobalConstants.DEFAULT_NB_LETTER_STAND / (GlobalConstants.DEFAULT_WIDTH_STAND / positionX));
    }

    private doTheManipulation(game: GameServer, player: Player, indexTileChanged: number) {
        this.handleLogicManipulation(game, player, indexTileChanged);
        this.handleViewManipulation(indexTileChanged, player);
        player.tileIndexManipulation = indexTileChanged;
        this.sendStandToClient(player);
    }

    private handleViewManipulation(indexTileChanged: number, player: Player) {
        player.stand[indexTileChanged].color = '#ff6600';
        player.stand[player.tileIndexManipulation].color = '#F7F7E3';
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
            if (tile.color === '#AEB1D9') {
                exchangeCmd = exchangeCmd + tile.letter.value;
            }
        }
        return exchangeCmd;
    }

    private resetExchangeTiles(player: Player) {
        for (let i = 0; i < player.stand.length; i++) {
            if (player.stand[i].color === '#AEB1D9') {
                this.resetTileStandAtPos(player, i);
            }
        }
    }

    private resetTileStandAtPos(player: Player, position: number) {
        player.stand[position].color = '#F7F7E3';
    }

    private clickIsInBoard(player: Player, position: Vec2) {
        const realPosInBoardPx: Vec2 = {
            x: position.x - GlobalConstants.SIZE_OUTER_BORDER_BOARD,
            y: position.y - GlobalConstants.SIZE_OUTER_BORDER_BOARD,
        };
        const isClickPosXInBoard: boolean = realPosInBoardPx.x > 0 && realPosInBoardPx.x < GlobalConstants.WIDTH_BOARD_NOBORDER;
        const isClickPosYInBoard: boolean = realPosInBoardPx.y > 0 && realPosInBoardPx.y < GlobalConstants.WIDTH_BOARD_NOBORDER;
        if (isClickPosXInBoard && isClickPosYInBoard) {
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('findTileToPlaceArrow', realPosInBoardPx);
        }
    }

    private sendStandToClient(player: Player) {
        this.sio.sockets.sockets.get(player.idPlayer)?.emit('sendStand', player);
    }
}
