import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Move } from '@app/classes/move';
import { Player } from '@app/classes/player';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { BoardExplorerService } from './board-explorer.service';
import { BoardService } from './board.service';
import { DictionaryService } from './dictionary.service';
import { LetterBankService } from './letter-bank.service';
import { ScoreCountService } from './score-count.service';
import { StandService } from './stand.service';

@Service()
export class PutLogicService {
    sio: io.Server;
    constructor(
        private standService: StandService,
        private dictionaryService: DictionaryService,
        private boardExplorerService: BoardExplorerService,
        private letterBankService: LetterBankService,
        private scoreCountService: ScoreCountService,
        private boardService: BoardService,
    ) {
        this.sio = new io.Server();
    }

    initSioPutLogic(sio: io.Server) {
        this.sio = sio;
    }

    computeWordVPToDraw(game: GameServer, player: Player, move: Move) {
        // we verify the validity of the word
        this.boardLogicUpdate(game, move.command, move.word);
        // Game update
        const opponent = game.mapPlayers.get(player.idOpponent);
        this.sio.sockets.sockets.get(player.idOpponent)?.emit('gameUpdateClient', {
            game,
            player: opponent,
            scoreOpponent: player?.score,
            nbLetterStandOpponent: player?.nbLetterStand,
        });

        this.updateStandOpponent(game, player, move.stand);
        this.scoreCountService.updateScore(move.score, player);
        game.noTileOnBoard = false;

        if (player.allLetterSwapped && !player.isMoveBingo) {
            player.allLetterSwapped = false;
        }
    }

    computeWordToDraw(game: GameServer, player: Player, position: string, word: string): boolean {
        // we verify the validity of the word
        this.boardLogicUpdate(game, position, word);
        // Game update
        const opponent = game.mapPlayers.get(player.idOpponent);
        this.sio.sockets.sockets.get(player.idPlayer)?.emit('gameUpdateClient', {
            game,
            player,
            scoreOpponent: opponent?.score,
            nbLetterStandOpponent: opponent?.nbLetterStand,
        });

        const isWordValid: boolean = this.checkWordsValidity(game, position);
        if (!isWordValid) {
            this.boardLogicRemove(game, position, word);
        } else {
            // Update the score
            const score = this.scoreCountService.countScoreArray(this.boardExplorerService.getWordArray(position, game.board));
            this.scoreCountService.updateScore(score, player);
            game.noTileOnBoard = false;
        }

        // Update the stand
        this.updateStandAndBoardAfterPlacement(game, player, word, position, isWordValid);
        return isWordValid;
    }

    computeWordToExchange(game: GameServer, player: Player, word: string) {
        if (word.length === GlobalConstants.DEFAULT_NB_LETTER_STAND) {
            player.allLetterSwapped = true;
        }
        this.standService.updateStandAfterExchange(word, game.letters, game.letterBank, player);
    }

    boardLogicUpdate(game: GameServer, position: string, word: string) {
        const letterWay: string = position.slice(GlobalConstants.POSITION_LAST_LETTER);
        const indexLine: number =
            position.slice(0, GlobalConstants.END_POSITION_INDEX_LINE).toLowerCase().charCodeAt(0) - GlobalConstants.ASCII_CODE_SHIFT;
        const indexColumn = Number(position.slice(GlobalConstants.END_POSITION_INDEX_LINE, position.length + GlobalConstants.POSITION_LAST_LETTER));
        const wordLength = word.length;

        if (letterWay === 'h') {
            for (let i = indexColumn; i < indexColumn + wordLength; i++) {
                const indexReadWord = i - indexColumn;
                if (game.board[indexLine][i].old) {
                    continue;
                }
                this.boardService.writeLetterInGameMap(word[indexReadWord], game);

                game.board[indexLine][i].letter.value = word[indexReadWord];
                game.board[indexLine][i].letter.weight = this.letterBankService.checkLetterWeight(word[indexReadWord], game.letterBank);
            }
        } else {
            for (let i = indexLine; i < indexLine + wordLength; i++) {
                const indexReadWord = i - indexLine;
                if (game.board[i][indexColumn].old) {
                    continue;
                }
                this.boardService.writeLetterInGameMap(word[indexReadWord], game);

                game.board[i][indexColumn].letter.value = word[indexReadWord];
                game.board[i][indexColumn].letter.weight = this.letterBankService.checkLetterWeight(word[indexReadWord], game.letterBank);
            }
        }
    }

    boardLogicRemove(game: GameServer, position: string, word: string) {
        const positionLastLetter = -1;
        const endPositionIndexLine = 1;
        const asciiCodeShift = 96;
        const letterWay: string = position.slice(positionLastLetter);
        const indexLine: number = position.slice(0, endPositionIndexLine).toLowerCase().charCodeAt(0) - asciiCodeShift;
        const indexColumn = Number(position.slice(endPositionIndexLine, position.length + positionLastLetter));
        const wordLength = word.length;

        if (letterWay === 'h') {
            for (let i = indexColumn; i < indexColumn + wordLength; i++) {
                if (game.board[indexLine][i].old) {
                    continue;
                }
                this.boardService.deleteLetterInBoardMap(game.board[indexLine][i].letter.value, game);

                game.board[indexLine][i].letter.value = '';
                game.board[indexLine][i].letter.weight = 0;
            }
        } else {
            for (let i = indexLine; i < indexLine + wordLength; i++) {
                if (game.board[i][indexColumn].old) {
                    continue;
                }
                this.boardService.deleteLetterInBoardMap(game.board[indexLine][i].letter.value, game);

                game.board[i][indexColumn].letter.value = '';
                game.board[i][indexColumn].letter.weight = 0;
            }
        }
    }

    private updateStandAndBoardAfterPlacement(game: GameServer, player: Player, word: string, position: string, isWordValid: boolean) {
        const arrayIndexWord: number[] = [];
        const arrayLetter: string[] = [];
        let areAllLetterOnStand = true;

        for (let i = 0; i < word.length; i++) {
            let letterToCheck: string = word[i];
            // Verify if this is a blank letter or not
            if (letterToCheck === letterToCheck.toUpperCase()) {
                letterToCheck = '*';
            }
            if (!player.mapLetterOnStand.has(letterToCheck)) {
                areAllLetterOnStand = false;
                continue;
            }
            if (this.verifyIfTileOnBoardAlready(game, letterToCheck, i, position)) {
                areAllLetterOnStand = false;
                continue;
            }

            for (let j = 0; j < GlobalConstants.NUMBER_SLOT_STAND; j++) {
                if (letterToCheck === player.stand[j].letter.value) {
                    this.standService.deleteLetterStandLogic(letterToCheck, j, player);

                    if (isWordValid) {
                        this.standService.putNewLetterOnStand(player.stand[j], game.letters, game.letterBank, player);
                    } else {
                        arrayIndexWord.push(j);
                        arrayLetter.push(letterToCheck);
                    }
                    break;
                }
            }
        }
        player.isMoveBingo = areAllLetterOnStand;

        // player update for stand
        this.sio.sockets.sockets.get(player.idPlayer)?.emit('playerUpdate', player);
        if (!isWordValid) {
            this.cancelUpdateOperation(game, player, arrayIndexWord, arrayLetter);
        }
    }

    private cancelUpdateOperation(game: GameServer, player: Player, arrayIndexWord: number[], arrayLetter: string[]) {
        const timeToWait = 4000;
        setTimeout(() => {
            let indexWord = 0;
            for (const positionIndex of arrayIndexWord) {
                this.standService.writeLetterStandLogic(positionIndex, arrayLetter[indexWord], game.letterBank, player);
                indexWord++;
            }
            // Game update
            const opponent = game.mapPlayers.get(player.idOpponent);
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('gameUpdateClient', {
                game,
                player,
                scoreOpponent: opponent?.score,
                nbLetterStandOpponent: opponent?.nbLetterStand,
            });
        }, timeToWait);
    }

    private verifyIfTileOnBoardAlready(game: GameServer, letterToCheck: string, indexLetter: number, position: string): boolean {
        const letterWay: string = position.slice(GlobalConstants.POSITION_LAST_LETTER);
        let indexLine: number =
            position.slice(0, GlobalConstants.END_POSITION_INDEX_LINE).toLowerCase().charCodeAt(0) - GlobalConstants.ASCII_CODE_SHIFT;
        let indexColumn = Number(position.slice(GlobalConstants.END_POSITION_INDEX_LINE, position.length + GlobalConstants.POSITION_LAST_LETTER));
        if (letterWay === 'h') {
            indexColumn += indexLetter;
        } else {
            indexLine += indexLetter;
        }
        const isLetterInBoardArray: boolean =
            game.board[indexLine][indexColumn].letter.value === letterToCheck && game.board[indexLine][indexColumn].old;
        return isLetterInBoardArray && game.mapLetterOnBoard.has(letterToCheck);
    }

    private checkWordsValidity(game: GameServer, startPosition: string): boolean {
        let isArrayValid = true;
        const wordArray = this.boardExplorerService.getWordArray(startPosition, game.board);
        const wordList = this.boardExplorerService.formWordString(wordArray);

        wordList.forEach((word) => {
            if (!this.dictionaryService.containsWord(word, game.trie)) {
                isArrayValid = false;
            }
        });
        return isArrayValid;
    }

    private updateStandOpponent(game: GameServer, player: Player, stand: string[]) {
        player.isMoveBingo = stand.length === 0;
        // We delete the old stand array
        for (let j = 0; j < GlobalConstants.NUMBER_SLOT_STAND; j++) {
            this.standService.deleteLetterArrayLogic(j, player);
        }
        // We reset the map
        for (const [key] of player.mapLetterOnStand) {
            player.mapLetterOnStand.delete(key);
        }
        // And then write the new one
        for (let j = 0; j < GlobalConstants.NUMBER_SLOT_STAND; j++) {
            if (j < stand.length) {
                this.standService.writeLetterStandLogic(j, stand[j], game.letterBank, player);
            } else {
                const newLetterToPlace = this.letterBankService.giveRandomLetter(1, game.letters, game.letterBank);
                this.standService.writeLetterStandLogic(j, newLetterToPlace, game.letterBank, player);
            }
        }
    }
}
