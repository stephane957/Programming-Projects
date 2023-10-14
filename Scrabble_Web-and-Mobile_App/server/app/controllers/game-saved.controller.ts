import { NextFunction, Request, Response } from 'express';
import { GameSaved } from '@app/classes/game-saved';
import GameSavedService from '@app/services/game-saved.service';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';

/* eslint-disable no-invalid-this */

export class GameSavedController {
    gameSavedService = new GameSavedService();

    getGames = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findAllFavouriteGames: GameSaved[] = (await this.gameSavedService.findAllGames()) as GameSaved[];

            res.status(HTTPStatusCode.OK).json({ data: findAllFavouriteGames, message: 'findAll' });
        } catch (error) {
            next(error);
        }
    };

    saveGame = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gameData = req.body;
            const savedGameData: GameSaved = await this.gameSavedService.saveGame(gameData.savedGame);

            res.status(HTTPStatusCode.Created).send(savedGameData._id);
        } catch (error) {
            next(error);
        }
    };
}
