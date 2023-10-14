/* eslint-disable max-lines */
import * as Constants from '@app/classes/global-constants';
import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import { PowerCard } from '@app/classes/power-card';
import { Service } from 'typedi';
import { StandService } from './stand.service';

import * as io from 'socket.io';
import { ChatMessage } from '@app/classes/chat-message';
import { TranslateService } from '@app/services/translate.service';

@Service()
export class PowerCardsService {
    sio: io.Server;
    constructor(private standService: StandService, private translateService: TranslateService) {
        this.sio = new io.Server();
    }

    initSioPowerCard(sio: io.Server) {
        this.sio = sio;
    }

    initPowerCards(game: GameServer, activationState: boolean[]) {
        for (let i = 0; i < game.powerCards.length; i++) {
            game.powerCards[i].isActivated = activationState[i];
        }
    }

    givePowerToPlayers(game: GameServer) {
        for (const player of game.mapPlayers.values()) {
            while (player.powerCards.length < 3) {
                this.givePowerCard(game, player);
            }
        }
    }

    // function that fills the player's power cards
    givePowerCard(game: GameServer, player: Player) {
        if (player.powerCards.length < 3) {
            player.powerCards.push(this.getRandomPower(game));
        }
    }

    powerCardsHandler(game: GameServer, player: Player, powerCardName: string, additionnalParams: string) {
        // delete the powercard from the player's hand
        this.deletePowerCard(player, powerCardName);

        switch (powerCardName) {
            case Constants.JUMP_NEXT_ENNEMY_TURN: {
                this.jmpNextEnnemyTurn(game, player.name);
                break;
            }
            case Constants.TRANFORM_EMPTY_TILE: {
                this.transformEmptyTile(game, player.name, additionnalParams);
                break;
            }
            case Constants.REDUCE_ENNEMY_TIME: {
                this.reduceEnnemyTime(game, player.name);
                break;
            }
            case Constants.EXCHANGE_LETTER_JOKER: {
                this.exchangeLetterJoker(game, player, additionnalParams);
                break;
            }
            case Constants.EXCHANGE_STAND: {
                this.exchangeStand(game, player, additionnalParams);
                break;
            }
            case Constants.REMOVE_POINTS_FROM_MAX: {
                this.removePointsFromMax(game, player.name);
                break;
            }
            case Constants.ADD_1_MIN: {
                this.add1MinToPlayerTime(game, player.name);
                break;
            }
            case Constants.REMOVE_1_POWER_CARD_FOR_EVERYONE: {
                this.remove1PowerCardForEveryone(game, player.name);
                break;
            }
            default:
                return;
        }
    }

    // the virtual player have a 50% chance to use a power card if he has one
    randomPowerCardVP(game: GameServer, virtualPlayer: Player) {
        const fiftyPercent = 0.5;
        const probaMove: number = this.giveProbaMove();

        if (probaMove < fiftyPercent || virtualPlayer.powerCards.length <= 0) {
            return;
        }

        const choosedPowerCard = virtualPlayer.powerCards[0];
        switch (choosedPowerCard.name) {
            case Constants.TRANFORM_EMPTY_TILE: {
                const maxTryToFindEmptyTile = 20;
                let counter = 0;
                let idxLine: number = this.randomIntFromInterval(1, Constants.NUMBER_SQUARE_H_AND_W);
                let idxColumn: number = this.randomIntFromInterval(1, Constants.NUMBER_SQUARE_H_AND_W);
                while (game.board[idxLine][idxColumn].letter.value !== '' || game.board[idxLine][idxColumn].bonus !== 'xx') {
                    idxLine = this.randomIntFromInterval(1, Constants.NUMBER_SQUARE_H_AND_W);
                    idxColumn = this.randomIntFromInterval(1, Constants.NUMBER_SQUARE_H_AND_W);
                    counter++;
                    if (counter > maxTryToFindEmptyTile) {
                        return;
                    }
                }
                const additionnalParams = idxLine.toString() + '-' + idxColumn.toString();
                this.powerCardsHandler(game, virtualPlayer, choosedPowerCard.name, additionnalParams);
                break;
            }
            case Constants.EXCHANGE_LETTER_JOKER: {
                // Choose a letter on the stand
                let idxLetterStand = 0;
                let didEnter = false;
                for (let i = 0; i < virtualPlayer.stand.length; i++) {
                    if (virtualPlayer.stand[i].letter.value === '') {
                        continue;
                    }
                    idxLetterStand = i;
                    didEnter = true;
                    break;
                }
                if (!didEnter) {
                    return;
                }
                // choose a letter in the letter bank
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const letterReserve: string[] = Array.from(game.letterBank.keys()).filter((letter) => game.letterBank.get(letter)!.quantity > 0);
                if (letterReserve.length <= 0) {
                    return;
                }
                const rdmLetter: string = letterReserve[this.randomIntFromInterval(0, letterReserve.length - 1)];

                const additionnalParams: string = rdmLetter + idxLetterStand.toString();
                this.powerCardsHandler(game, virtualPlayer, choosedPowerCard.name, additionnalParams);
                break;
            }
            case Constants.EXCHANGE_STAND: {
                const otherPlayersName: string[] = Array.from(game.mapPlayers.keys()).filter((name) => name !== virtualPlayer.name);
                if (otherPlayersName.length <= 0) {
                    return;
                }
                const additionnalParams: string = otherPlayersName[this.randomIntFromInterval(0, otherPlayersName.length - 1)];
                this.powerCardsHandler(game, virtualPlayer, choosedPowerCard.name, additionnalParams);
                break;
            }
            default: {
                this.powerCardsHandler(game, virtualPlayer, choosedPowerCard.name, '');
                break;
            }
        }
    }

    private randomIntFromInterval(min: number, max: number) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private giveProbaMove(): number {
        return Math.random();
    }

    private jmpNextEnnemyTurn(game: GameServer, playerName: string) {
        game.jmpNextEnnemyTurn = true;
        this.sendMsgToAllInRoomWithTranslation(game, ['THE_PLAYER', playerName, 'POWER1']);
    }

    private transformEmptyTile(game: GameServer, playerName: string, infoOnAction: string) {
        const splittedIdxs = infoOnAction.split('-');
        const idxLine = splittedIdxs[0];
        const idxColumn = splittedIdxs[1];

        const rdmBonus = this.getRandomBonusTile();
        game.board[idxLine][idxColumn].bonus = rdmBonus;
        game.bonusBoard[idxLine][idxColumn] = rdmBonus;

        this.sendMsgToAllInRoomWithTranslation(game, [
            'THE_PLAYER',
            playerName,
            'POWER2',
            idxLine.toString(),
            'COLUMN',
            idxColumn.toString(),
            'IN',
            rdmBonus,
            'BONUS',
        ]);
    }

    private getRandomBonusTile(): string {
        const bonusPossibilities = ['wordx3', 'wordx2', 'letterx3', 'letterx2'];
        const bonus = bonusPossibilities[Math.floor(Math.random() * bonusPossibilities.length)];
        return bonus;
    }

    private reduceEnnemyTime(game: GameServer, playerName: string) {
        game.reduceEnnemyNbTurn = 3;
        this.sendMsgToAllInRoomWithTranslation(game, ['THE_PLAYER', playerName, 'POWER3']);
    }

    private exchangeLetterJoker(game: GameServer, player: Player, infoOnAction: string) {
        // letter is in uppercase
        const letterToTakeFromReserve = infoOnAction[0];
        const tileToTakeFromStand = player.stand[parseInt(infoOnAction[1], 10)];
        const letterToSubstact = game.letterBank.get(infoOnAction[0].toUpperCase());
        if (!letterToSubstact || !letterToSubstact) {
            return;
        }
        const letterToAdd = game.letterBank.get(tileToTakeFromStand.letter.value.toUpperCase());
        if (!letterToAdd) {
            return;
        }
        letterToSubstact.quantity--;
        letterToAdd.quantity++;
        game.letterBank.set(letterToTakeFromReserve, letterToSubstact);
        game.letterBank.set(tileToTakeFromStand.letter.value, letterToAdd);

        this.standService.deleteLetterStandLogic(tileToTakeFromStand.letter.value, parseInt(infoOnAction[1], 10), player);
        this.standService.writeLetterStandLogic(parseInt(infoOnAction[1], 10), letterToTakeFromReserve.toLowerCase(), game.letterBank, player);

        this.sendMsgToAllInRoomWithTranslation(game, ['THE_PLAYER', player.name, 'POWER4']);
    }

    private exchangeStand(game: GameServer, player: Player, playerTargetName: string) {
        const playerTarget = game.mapPlayers.get(playerTargetName);
        if (playerTarget === undefined) {
            return;
        }

        // change the stand of hands
        const playerStand = player.stand;
        player.stand = playerTarget.stand;
        playerTarget.stand = playerStand;
        // do the same for the map
        const playerLetterMap = player.mapLetterOnStand;
        player.mapLetterOnStand = playerTarget.mapLetterOnStand;
        playerTarget.mapLetterOnStand = playerLetterMap;

        this.sendMsgToAllInRoomWithTranslation(game, ['THE_PLAYER', player.name, 'POWER5', playerTargetName, '!']);
    }

    private removePointsFromMax(game: GameServer, playerName: string) {
        const pointsToRm = 20;
        const playerWithMaxScore = this.findPlayerWithMaxScore(game);
        playerWithMaxScore.score -= pointsToRm;
        for (const player of game.mapPlayers.values()) {
            player.score += pointsToRm / game.mapPlayers.size;
        }
        this.sendMsgToAllInRoomWithTranslation(game, [
            'THE_PLAYER',
            playerName,
            'POWER6',
            'THE_PLAYER',
            playerWithMaxScore.name,
            'HAS_LOST',
            pointsToRm.toString(),
            'SCORE',
            'POWER7',
        ]);
    }

    private add1MinToPlayerTime(game: GameServer, playerName: string) {
        const timeToAdd = 60;
        this.addSecsToTimePlayer(game, timeToAdd);
        this.sendMsgToAllInRoomWithTranslation(game, ['THE_PLAYER', playerName, 'POWER8']);
    }

    private addSecsToTimePlayer(game: GameServer, timeToAdd: number) {
        this.sio.to(game.roomName + Constants.GAME_SUFFIX)?.emit('addSecsToTimer', timeToAdd);
    }

    private remove1PowerCardForEveryone(game: GameServer, playerNameUsingCard: string) {
        for (const player of game.mapPlayers.values()) {
            if (player.name === playerNameUsingCard) {
                continue;
            }
            if (player.powerCards.length > 0) {
                this.deletePowerCard(player, player.powerCards[0].name);
            }
        }
    }

    private findPlayerWithMaxScore(game: GameServer): Player {
        let playerWithMaxScore: Player = new Player('maxScoreDefaultPlayer', false);
        let maxPoints = -100;
        for (const player of game.mapPlayers.values()) {
            if (player.score > maxPoints) {
                maxPoints = player.score;
                playerWithMaxScore = player;
            }
        }
        return playerWithMaxScore;
    }

    private deletePowerCard(player: Player, powerCardName: string) {
        for (const powerCard of player.powerCards) {
            if (powerCard.name === powerCardName) {
                player.powerCards.splice(player.powerCards.indexOf(powerCard), 1);
                return;
            }
        }
    }

    private getRandomPower(game: GameServer): PowerCard {
        const availablePowerCards = game.powerCards.filter((powerCard) => powerCard.isActivated);
        const randomCard = availablePowerCards[Math.floor(Math.random() * availablePowerCards.length)];
        return randomCard;
    }

    private sendMsgToAllInRoomWithTranslation(game: GameServer, message: string[]) {
        for (const player of game.mapPlayers.values()) {
            let fullMessage = '';
            message.forEach((element) => {
                const value = this.translateService.translateMessage(player.name, element);
                if (value !== '') {
                    fullMessage += value;
                } else {
                    fullMessage += element;
                }
            });
            player.chatHistory.push(new ChatMessage(Constants.SYSTEM_SENDER, fullMessage));
        }
        for (const spectator of game.mapSpectators.values()) {
            let fullMessage = '';
            message.forEach((element) => {
                const value = this.translateService.translateMessage(spectator.name, element);
                if (value !== '') {
                    fullMessage += value;
                } else {
                    fullMessage += element;
                }
            });
            spectator.chatHistory.push(new ChatMessage(Constants.SYSTEM_SENDER, fullMessage));
        }
    }
}
