import { Router } from 'express';
import { GameSavedController } from '@app/controllers/game-saved.controller';
import { Routes } from '@app/classes/routes.interface';

class GameSavedRoute implements Routes {
    path = '/games';
    router = Router();
    gameSavedController = new GameSavedController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(`${this.path}`, this.gameSavedController.getGames);
        this.router.post(`${this.path}`, this.gameSavedController.saveGame);
    }
}

export default GameSavedRoute;
