import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { PutLogicService } from '@app/services/put-logic.service';
import { Service } from 'typedi';
import { ChatService } from './chat.service';
import { ObjectiveService } from './objective.service';
import { PlayAreaService } from './play-area.service';

@Service()
export class CommunicationBoxService {
    constructor(
        private chatService: ChatService,
        private putLogicService: PutLogicService,
        private playAreaService: PlayAreaService,
        private objectiveService: ObjectiveService,
    ) {}

    // function that shows the content of the input, place it in the array of message then delte the input field
    onEnter(game: GameServer, player: Player, input: string): boolean {
        const dataSeparated = input.split(' ');

        switch (dataSeparated[0]) {
            case '!placer': {
                if (this.chatService.sendMessage(input, game, player)) {
                    if (this.putLogicService.computeWordToDraw(game, player, dataSeparated[1], dataSeparated[2])) {
                        // We check if an objective has been completed
                        const playerThatJustPlayed = game.mapPlayers.get(game.currentPlayerId);
                        if (playerThatJustPlayed && game.isLog2990Enabled) {
                            this.objectiveService.isPlayerObjectivesCompleted(game, playerThatJustPlayed, input);
                        }
                        // We change the turn
                        this.playAreaService.changePlayer(game);
                    } else {
                        const opponent = game.mapPlayers.get(player.idOpponent);
                        player.chatHistory.pop();
                        player.chatHistory.pop();
                        player.chatHistory.push({ message: GlobalConstants.WORD_DOESNT_EXIST, isCommand: false, sender: 'S' });
                        opponent?.chatHistory.pop();

                        // We change the turn
                        this.playAreaService.changePlayer(game);
                        return false;
                    }
                }
                break;
            }
            case '!échanger': {
                if (this.chatService.sendMessage(input, game, player)) {
                    this.putLogicService.computeWordToExchange(game, player, dataSeparated[1]);
                    // We check if an objective has been completed
                    const playerThatJustPlayed = game.mapPlayers.get(game.currentPlayerId);
                    if (playerThatJustPlayed && game.isLog2990Enabled) {
                        this.objectiveService.isPlayerObjectivesCompleted(game, playerThatJustPlayed, input);
                    }
                    // We change the turn
                    this.playAreaService.changePlayer(game);
                }
                break;
            }
            case '!passer': {
                if (this.chatService.sendMessage(input, game, player)) {
                    // We check if an objective has been completed
                    const playerThatJustPlayed = game.mapPlayers.get(game.currentPlayerId);
                    if (playerThatJustPlayed && game.isLog2990Enabled) {
                        this.objectiveService.isPlayerObjectivesCompleted(game, playerThatJustPlayed, input);
                    }
                    // We change the turn
                    this.playAreaService.changePlayer(game);
                }
                break;
            }
            case '!reserve': {
                if (this.chatService.sendMessage(input, game, player) && player.debugOn) {
                    this.chatService.printReserveStatus(game, player);
                }
                break;
            }
            default: {
                this.chatService.sendMessage(input, game, player);
            }
        }
        return true;
    }
}
