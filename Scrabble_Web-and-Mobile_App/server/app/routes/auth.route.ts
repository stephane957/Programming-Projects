import { Routes } from '@app/classes/routes.interface';
import AuthController from '@app/controllers/auth.controller';
import { authMiddleware } from '@app/utils/auth';
import { CreateUserValidator, LoginUserValidator, validationMiddleware } from '@app/utils/validators';
import { Router } from 'express';

class AuthRoute implements Routes {
    path = '/';
    router = Router();
    authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}signup`, validationMiddleware(CreateUserValidator, 'body'), this.authController.signUp);
        this.router.post(`${this.path}login`, validationMiddleware(LoginUserValidator, 'body'), this.authController.logIn);
        this.router.post(`${this.path}soft-login`, authMiddleware, this.authController.softLogin);
        this.router.post(`${this.path}logout`, authMiddleware, this.authController.logOut);
    }
}

export default AuthRoute;
