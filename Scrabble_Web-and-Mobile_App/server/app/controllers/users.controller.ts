import { NextFunction, Request, Response } from 'express';
import { CreateUserValidator } from '@app/utils/validators';
import { User } from '@app/classes/users.interface';
import UserService from '@app/services/user.service';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import { GameSaved } from '@app/classes/game-saved';

/* eslint-disable no-invalid-this */

class UsersController {
    userService = new UserService();

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findAllUsersData: User[] = await this.userService.findAllUser();

            res.status(HTTPStatusCode.OK).json({ data: findAllUsersData, message: 'findAll' });
        } catch (error) {
            next(error);
        }
    };

    getFavouriteGames = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const findGamesData: GameSaved[] = await this.userService.findFavouriteGames(userId);

            res.status(HTTPStatusCode.OK).send(findGamesData);
        } catch (error) {
            next(error);
        }
    };

    getUserByName = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userName: string = req.params.name;
            const findOneUserData: User = await this.userService.findUserByName(userName);

            res.status(HTTPStatusCode.OK).json({ data: findOneUserData, message: 'findOne' });
        } catch (error) {
            next(error);
        }
    };

    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const findOneUserData: User = await this.userService.findUserById(userId);

            res.status(HTTPStatusCode.OK).json({ data: findOneUserData, message: 'findOne' });
        } catch (error) {
            next(error);
        }
    };

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserValidator = req.body;
            const createUserData: User = await this.userService.createUser(userData);

            res.status(HTTPStatusCode.Created).json({ data: createUserData, message: 'created' });
        } catch (error) {
            next(error);
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const userData: CreateUserValidator = req.body;
            const updateUserData: User = await this.userService.updateUser(userId, userData);

            res.status(HTTPStatusCode.OK).json({ data: updateUserData, message: 'updated' });
        } catch (error) {
            next(error);
        }
    };

    updateFavouriteGames = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const gameId: string = req.body.gameId;
            const updateUserData: User = await this.userService.updateFavouriteGames(userId, gameId);

            res.status(HTTPStatusCode.OK).json({ data: updateUserData, message: 'updated' });
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const deleteUserData: User = await this.userService.deleteUser(userId);

            res.status(HTTPStatusCode.OK).json({ data: deleteUserData, message: 'deleted' });
        } catch (error) {
            next(error);
        }
    };

    updateThemeUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const theme: string = req.body.theme;
            const updateUserData: User = await this.userService.updateTheme(userId, theme);

            res.status(HTTPStatusCode.OK).json({ data: updateUserData, message: 'updated' });
        } catch (error) {
            next(error);
        }
    };

    updateLanguageUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const language: string = req.body.language;
            const updateUserData: User = await this.userService.updateLanguage(userId, language);

            res.status(HTTPStatusCode.OK).json({ data: updateUserData, message: 'updated' });
        } catch (error) {
            next(error);
        }
    };
}

export default UsersController;
