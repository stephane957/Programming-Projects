import { HttpException } from '@app/classes/http.exception';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as logger from 'morgan';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import UsersRoute from '@app/routes/users.route';
import { Routes } from '@app/classes/routes.interface';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import AuthRoute from '@app/routes/auth.route';
import AvatarRoute from '@app/routes/avatar.route';
import GameSavedRoute from '@app/routes/game-saved.route';
import ChatroomsModel from '@app/models/chatrooms.model';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options;

    constructor() {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();
        this.setupGeneralChatroom();
        this.bindRoutes([new UsersRoute(), new AuthRoute(), new AvatarRoute(), new GameSavedRoute()]);
    }

    bindRoutes(routes: Routes[]): void {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(express.json({ limit: '800mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException(HTTPStatusCode.NotFound, 'Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }

    private async setupGeneralChatroom() {
        const generalRoom = await ChatroomsModel.findOne({ name: 'general' });
        if (!generalRoom) {
            await ChatroomsModel.create({
                name: 'general',
                participants: [],
                chatHistory: [],
            });
        }
    }
}
