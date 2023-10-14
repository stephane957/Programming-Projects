import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { EndGameService } from '@app/services/end-game.service';
import { ValidationService } from '@app/services/validation.service';
import { Service } from 'typedi';
import { ObjectiveService } from './objective.service';

enum Commands {
    Place = '!placer',
    Exchange = '!échanger',
    Pass = '!passer',
    Debug = '!debug',
    Help = '!aide',
    Reserve = '!reserve',
}

@Service()
export class ChatService {
    constructor(private validator: ValidationService, private endGameService: EndGameService, private objectiveService: ObjectiveService) {}

    // verify if a command is entered and redirect to corresponding function
    sendMessage(input: string, game: GameServer, player: Player): boolean {
        const command: string = input.split(' ', 1)[0];
        if (input[0] === '!') {
            if (game.gameFinished) {
                this.sendMessageToBothPlayer(game, player, GlobalConstants.GAME_IS_OVER, true, 'S', false);
                return false;
            }
            const isActionCommand: boolean = command === Commands.Place || command === Commands.Exchange || command === Commands.Pass;
            if (isActionCommand && !(player.idPlayer === game.currentPlayerId)) {
                player.chatHistory.push({ message: 'You ' + ' : ' + input, isCommand: true, sender: 'P' });
                player.chatHistory.push({ message: GlobalConstants.NOT_YOUR_TURN, isCommand: false, sender: 'S' });
                return false;
            }
            // verify that the command is valid
            if (!this.validator.isCommandValid(input)) {
                player.chatHistory.push({ message: GlobalConstants.INVALID_ENTRY, isCommand: false, sender: 'S' });
                return false;
            }
            // verify the syntax
            const syntaxError = this.validator.syntaxIsValid(input, game, player);
            if (syntaxError !== '') {
                player.chatHistory.push({ message: GlobalConstants.INVALID_SYNTAX + syntaxError, isCommand: false, sender: 'S' });
                return false;
            }

            if (command === Commands.Place) {
                const graphicsError = this.validator.verifyPlacementOnBoard(input.split(' ', 3), game, player);
                if (graphicsError !== '') {
                    player.chatHistory.push({ message: GlobalConstants.UNABLE_TO_PROCESS_COMMAND + graphicsError, isCommand: true, sender: 'S' });
                    return false;
                }
            }
            this.commandFilter(input, game, player);
            return true;
        }
        if (this.validator.entryIsTooLong(input)) {
            // verify the length of the command
            player.chatHistory.push({ message: GlobalConstants.INVALID_LENGTH, isCommand: false, sender: 'S' });
            return false;
        }
        this.sendMessageToBothPlayer(game, player, input, false, 'P', true);
        return true;
    }

    printReserveStatus(game: GameServer, player: Player) {
        for (const key of game.letterBank.keys()) {
            const letterData = game.letterBank.get(key);
            player.chatHistory.push({ message: key + ' : ' + letterData?.quantity, isCommand: false, sender: 'S' });
        }
    }

    placeCommand(input: string, game: GameServer, player: Player) {
        player.passInARow = 0;

        this.sendMessageToBothPlayer(game, player, input, true, 'P', true);
        player.chatHistory.push({ message: GlobalConstants.PLACE_CMD, isCommand: false, sender: 'S' });

        if (this.validator.reserveIsEmpty(game.letterBank) && this.validator.standEmpty(player)) {
            this.showEndGameStats(game, player, false);
            game.gameFinished = true;
        }
    }

    // function to pass turn
    passCommand(input: string, game: GameServer, player: Player) {
        const playerThatJustPlayed = game.mapPlayers.get(game.currentPlayerId);
        if (playerThatJustPlayed && game.isLog2990Enabled) {
            this.objectiveService.isPlayerObjectivesCompleted(game, playerThatJustPlayed, input);
        }
        player.passInARow++;
        this.sendMessageToBothPlayer(game, player, input, true, 'P', true);
        player.chatHistory.push({ message: GlobalConstants.PASS_CMD, isCommand: false, sender: 'S' });

        const opponent = game.mapPlayers.get(player.idOpponent);
        if (opponent && player.passInARow >= 3 && opponent.passInARow >= 3) {
            this.showEndGameStats(game, player, false);
            game.gameFinished = true;
        }
    }

    // filter the command to call the correct function
    private commandFilter(input: string, game: GameServer, player: Player): void {
        const command = input.split(' ', 1)[0];
        switch (command) {
            case Commands.Place:
                this.placeCommand(input, game, player);
                break;
            case Commands.Exchange:
                this.exchangeCommand(input, game, player);
                break;
            case Commands.Pass:
                this.passCommand(input, game, player);
                break;
            case Commands.Debug:
                this.debugCommand(input, player, game);
                break;
            case Commands.Help:
                this.helpCommand(input, player);
                break;
            case Commands.Reserve:
                this.reserveCommand(input, player);
                break;
        }
    }

    private exchangeCommand(input: string, game: GameServer, player: Player) {
        player.passInARow = 0;
        this.sendMessageToBothPlayer(game, player, input, true, 'P', true);
        player.chatHistory.push({ message: GlobalConstants.EXCHANGE_PLAYER_CMD, isCommand: false, sender: 'S' });
    }

    // function that shows the reserve
    private reserveCommand(input: string, player: Player) {
        if (player.debugOn) {
            player.chatHistory.push({ message: input, isCommand: true, sender: 'P' });
            player.chatHistory.push({ message: GlobalConstants.RESERVE_CMD, isCommand: false, sender: 'S' });
        } else {
            player.chatHistory.push({ message: GlobalConstants.DEBUG_NOT_ACTIVATED, isCommand: false, sender: 'S' });
        }
    }

    // function that shows the help command
    private helpCommand(input: string, player: Player) {
        player.chatHistory.push({ message: input, isCommand: true, sender: 'P' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_PLACE, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_PASS, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_EXCHANGE, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_RESERVE, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_DEBUG, isCommand: false, sender: 'S' });
    }

    private debugCommand(input: string, player: Player, game: GameServer) {
        const opponent = game.mapPlayers.get(player.idOpponent);
        if (opponent) {
            opponent.debugOn = !opponent.debugOn;
        }

        player.chatHistory.push({ message: input, isCommand: true, sender: 'P' });
        if (player.debugOn) {
            player.chatHistory.push({ message: GlobalConstants.DEBUG_CMD_ON, isCommand: false, sender: 'S' });
        } else {
            player.chatHistory.push({ message: GlobalConstants.DEBUG_CMD_OFF, isCommand: false, sender: 'S' });
        }
    }

    private showEndGameStats(game: GameServer, player: Player, gameAbandoned: boolean) {
        const opponent = game.mapPlayers.get(player.idOpponent);
        if (!opponent) {
            return;
        }
        this.sendMessageToBothPlayer(game, player, GlobalConstants.END_OF_GAME, false, 'S', false);
        this.sendMessageToBothPlayer(game, player, player.name + ' : ' + this.endGameService.listLetterStillOnStand(player), false, 'S', false);
        this.sendMessageToBothPlayer(game, player, opponent.name + ' : ' + this.endGameService.listLetterStillOnStand(opponent), false, 'S', false);

        if (!gameAbandoned) {
            this.sendWinnerMessage(game, player, opponent);
        }
    }

    private sendWinnerMessage(game: GameServer, player: Player, opponent: Player) {
        const winner = this.endGameService.chooseWinner(game, player, opponent);

        if (winner === GlobalConstants.PLAYER_WIN) {
            this.sendMessageToBothPlayer(
                game,
                player,
                GlobalConstants.WINNER_MSG_PT1 + player.name + GlobalConstants.WINNER_MSG_PT2 + player.score,
                false,
                'S',
                false,
            );
        } else if (winner === GlobalConstants.OPPONENT_WIN) {
            this.sendMessageToBothPlayer(
                game,
                player,
                GlobalConstants.WINNER_MSG_PT1 + opponent.name + GlobalConstants.WINNER_MSG_PT2 + player.score,
                false,
                'S',
                false,
            );
        } else {
            this.sendMessageToBothPlayer(game, player, GlobalConstants.DRAW_MSG, false, 'S', false);
        }
    }

    private sendMessageToBothPlayer(
        game: GameServer,
        player: Player,
        messageChat: string,
        command: boolean,
        messageSender: string,
        pushNamePlayer: boolean,
    ) {
        let senderOpponent = '';
        if (messageSender === 'P') {
            senderOpponent = 'O';
        } else {
            senderOpponent = 'S';
        }
        if (pushNamePlayer) {
            player.chatHistory.push({ message: 'You : ' + messageChat, isCommand: command, sender: messageSender });
            game.mapPlayers
                .get(player.idOpponent)
                ?.chatHistory.push({ message: player.name + ' : ' + messageChat, isCommand: command, sender: senderOpponent });
        } else {
            player.chatHistory.push({ message: messageChat, isCommand: command, sender: messageSender });
            game.mapPlayers.get(player.idOpponent)?.chatHistory.push({ message: messageChat, isCommand: command, sender: senderOpponent });
        }
    }
}
