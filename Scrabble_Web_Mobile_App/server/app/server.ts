/* eslint-disable no-console */
import { Application } from '@app/app';
import { CommunicationBoxService } from '@app/services/communication-box.service';
import { MouseEventService } from '@app/services/mouse-event.service';
import { SocketManager } from '@app/services/socket-manager.service';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Service } from 'typedi';
import { BoardService } from './services/board.service';
import { ChatService } from './services/chat.service';
import { DatabaseService } from './services/database.service';
import { DictionaryService } from './services/dictionary.service';
import { PlayAreaService } from './services/play-area.service';
import { PutLogicService } from './services/put-logic.service';
import { StandService } from './services/stand.service';

const baseDix = 10;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    private static readonly baseDix: number = baseDix;
    socketManager: SocketManager;
    private server: http.Server;

    constructor(
        private readonly application: Application,
        private mouseEventService: MouseEventService,
        private communicationBoxService: CommunicationBoxService,
        private playAreaService: PlayAreaService,
        private chatService: ChatService,
        private standService: StandService,
        private boardService: BoardService,
        private putLogicService: PutLogicService,
        private databaseService: DatabaseService,
        private dictionaryService: DictionaryService,
    ) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    async init(): Promise<void> {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.socketManager = new SocketManager(
            this.server,
            this.mouseEventService,
            this.communicationBoxService,
            this.playAreaService,
            this.chatService,
            this.standService,
            this.boardService,
            this.putLogicService,
            this.databaseService,
            this.dictionaryService,
        );
        this.socketManager.handleSockets();

        this.server.listen(Server.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
        try {
            await this.databaseService.start();
            console.log('Connexion à la base de donnée MongoDB établie !');
        } catch {
            console.error('Connexion à la base de donnée a échoué ! Redémarrez le serveur et vérifier votre connexion Internet.');
            // process.exit(1);
        }
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }
}
