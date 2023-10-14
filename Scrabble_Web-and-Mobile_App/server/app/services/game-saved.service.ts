import { Service } from 'typedi';
import gameSavedModel from '@app/models/game-saved.model';
import { GameSaved } from '@app/classes/game-saved';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import { HttpException } from '@app/classes/http.exception';

@Service()
class GameSavedService {
    gamesSaved = gameSavedModel;

    async findAllGames(): Promise<GameSaved[]> {
        return this.gamesSaved.find();
    }

    async findGamesById(gamesIds: string[] | undefined): Promise<GameSaved[]> {
        if (!gamesIds) {
            throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no ids sent');
        }

        // eslint-disable-next-line prefer-const
        let favouriteGames: GameSaved[] = [];
        for await (const gameId of gamesIds) {
            const findGame = (await this.gamesSaved.findOne({ _id: gameId })) as GameSaved;

            if (!findGame) throw new HttpException(HTTPStatusCode.NotFound, 'Game not found');

            favouriteGames.push((await this.gamesSaved.findOne({ _id: gameId })) as GameSaved);
        }
        return favouriteGames;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async saveGame(gameData: GameSaved) {
        if (!gameData) throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no data sent');

        const findSavedGame: GameSaved = (await this.gamesSaved.findOne({
            roomName: gameData.roomName,
            gameStartDate: gameData.gameStartDate,
        })) as GameSaved;

        if (!findSavedGame) {
            // eslint-disable-next-line no-console
            console.log('Game saved!');
            return await this.gamesSaved.create({
                roomName: gameData.roomName,
                players: gameData.players,
                scores: gameData.scores,
                spectators: gameData.spectators,
                winners: gameData.winners,
                numberOfTurns: gameData.numberOfTurns,
                gameStartDate: gameData.gameStartDate,
                playingTime: gameData.playingTime,
                nbLetterReserve: gameData.nbLetterReserve,
            });
        }
        return findSavedGame;
    }
}

export default GameSavedService;
