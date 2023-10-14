import { ChatMessage } from '@app/classes/chat-message';
import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { Spectator } from '@app/classes/spectator';
import { PutLogicService } from '@app/services/put-logic.service';
import { Service } from 'typedi';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
import { PlayAreaService } from './play-area.service';
import { PowerCardsService } from './power-cards.service';
import { StandService } from './stand.service';
import { TranslateService } from '@app/services/translate.service';

@Service()
export class CommunicationBoxService {
    constructor(
        private chatService: ChatService,
        private putLogicService: PutLogicService,
        private playAreaService: PlayAreaService,
        private standService: StandService,
        private boardService: BoardService,
        private powerCardsService: PowerCardsService,
        private translateService: TranslateService,
    ) {}

    // function that shows the content of the input, place it in the array of message then delte the input field
    async onEnterPlayer(game: GameServer, player: Player, input: string): Promise<boolean> {
        const dataSeparated = input.split(' ');

        // checking if msg is a command of not
        // we don't want commands until the game is started
        if (dataSeparated[0][0] === '!' && !game.gameStarted) {
            player?.chatHistory.push(
                new ChatMessage(Constants.SYSTEM_SENDER, this.translateService.translateMessage(player.name, 'GAME_NOT_STARTED')),
            );
            return false;
        }

        switch (dataSeparated[0]) {
            case '!placer': {
                if (!(await this.chatService.sendMessage(input, game, player))) {
                    // if there is a problem with the message we the letters to the stand
                    // and delete them from the board
                    const letterNotWellUsed = this.boardService.rmTempTiles(game);
                    this.standService.putLettersOnStand(game, letterNotWellUsed, player);
                    return false;
                }
                if (this.putLogicService.computeWordToDraw(game, player, dataSeparated[1], dataSeparated[2])) {
                    // We change the turn if word is valid
                    this.playAreaService.changePlayer(game);
                    // if the power-card mode is active we add a power card to the player
                    player.nbValidWordPlaced++;
                    if (game.gameMode === Constants.POWER_CARDS_MODE && player.nbValidWordPlaced >= 3) {
                        this.powerCardsService.givePowerCard(game, player);
                        player.nbValidWordPlaced = 0;
                    }
                } else {
                    // word isn't valid
                    // pops the msg that shoulnd't have beent sent
                    for (const playerElem of game.mapPlayers.values()) {
                        // poping the msg "PlayerName: !placer pos foo"
                        playerElem.chatHistory.pop();
                        if (playerElem.name === player.name) {
                            // poping the msg "Vous avez placé vos lettres"
                            playerElem.chatHistory.pop();
                            player?.chatHistory.push(
                                new ChatMessage(Constants.SYSTEM_SENDER, this.translateService.translateMessage(player.name, 'WORD_DOESNT_EXIST')),
                            );
                        }
                    }

                    for (const spectator of game.mapSpectators.values()) {
                        spectator.chatHistory.pop();
                    }
                    // we don't want to explicitly switch the player's turn for now
                    // bc it the following timeout would make problems so we control his actions
                    this.playAreaService.sio.sockets.sockets.get(player.id)?.emit('changeIsTurnOursStatus', false);

                    // timeout bc this is the time before the letter are back to the player
                    setTimeout(() => {
                        // sending to the player and spectators in the game that the player
                        // tried a word
                        for (const playerElem of game.mapPlayers.values()) {
                            if (playerElem.name === player.name) {
                                continue;
                            }
                            player?.chatHistory.push(
                                new ChatMessage(
                                    Constants.SYSTEM_SENDER,
                                    this.translateService.translateMessage(player.name, 'THE_PLAYER') +
                                        player.name +
                                        this.translateService.translateMessage(player.name, 'PLAYER_TRIED_A_WORD'),
                                ),
                            );
                        }
                        for (const spectator of game.mapSpectators.values()) {
                            spectator.chatHistory.push(
                                new ChatMessage(
                                    Constants.SYSTEM_SENDER,
                                    this.translateService.translateMessage(player.name, 'THE_PLAYER') +
                                        player.name +
                                        this.translateService.translateMessage(player.name, 'PLAYER_TRIED_A_WORD'),
                                ),
                            );
                        }
                        // remove the word from the board bc it isn't valid
                        this.putLogicService.boardLogicRemove(game, dataSeparated[1], dataSeparated[2]);
                        // puts the letters back to the player's stand
                        this.standService.putLettersOnStand(game, dataSeparated[2], player);
                        // send game state to clients
                        this.putLogicService.sendGameToAllClientInRoom(game);
                        // switch the turn of the player
                        this.playAreaService.changePlayer(game);
                    }, Constants.TIME_DELAY_RM_BAD_WORD);
                    return false;
                }
                break;
            }
            case '!échanger': {
                if (await this.chatService.sendMessage(input, game, player)) {
                    this.putLogicService.computeWordToExchange(game, player, dataSeparated[1]);
                    // We change the turn
                    this.playAreaService.changePlayer(game);
                }
                break;
            }
            case '!passer': {
                if (await this.chatService.sendMessage(input, game, player)) {
                    // We change the turn
                    this.playAreaService.changePlayer(game);
                }
                break;
            }
            case '!reserve': {
                if ((await this.chatService.sendMessage(input, game, player)) && player.debugOn) {
                    this.chatService.printReserveStatus(game, player);
                }
                break;
            }
            default: {
                await this.chatService.sendMessage(input, game, player);
            }
        }
        return true;
    }
    async onEnterSpectator(game: GameServer, spec: Spectator, input: string) {
        if (this.chatService.validator.entryIsTooLong(input)) {
            spec.chatHistory.push(new ChatMessage(Constants.SYSTEM_SENDER, this.translateService.translateMessage(spec.name, 'INVALID_LENGTH')));
            return;
        }
        this.chatService.pushMsgToAllPlayers(game, spec.name, input, false, 'P');
    }
}
