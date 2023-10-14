import * as Constants from '@app/classes/global-constants';
import { RankedGame } from '@app/classes/ranked-game';
import { RankedUser } from '@app/classes/ranked-user';
import { User } from '@app/classes/users.interface';
import * as io from 'socket.io';
import { Service } from 'typedi';

@Service()
export class MatchmakingService {
    sio: io.Server;
    rooms: Map<string, RankedGame>; // key:first player name value:RankedGame
    constructor() {
        this.sio = new io.Server();
        this.rooms = new Map<string, RankedGame>();
    }

    initSioMatchmaking(sio: io.Server) {
        this.sio = sio;
    }

    findARoomForPlayer(socket: io.Socket, eloDisparity: number, user: User) {
        for (const rankedGame of this.rooms.values()) {
            if (this.doesPlayerFitInARoom(rankedGame, eloDisparity, user.elo)) {
                if (rankedGame.matchFound === false) {
                    this.joinRoom(socket, rankedGame, user, eloDisparity);
                    if (rankedGame.rankedUsers.length === Constants.MAX_PERSON_PLAYING) {
                        this.rankedMatchFound(rankedGame, socket);
                    }
                    return;
                }
            }
        }
        this.createRoom(socket, user, eloDisparity);
    }

    doesPlayerFitInARoom(rankedGame: RankedGame, eloDisparity: number, playerElo: number): boolean {
        for (const rankedUser of rankedGame.rankedUsers) {
            const eloDiff: number = Math.abs(playerElo - rankedUser.elo);
            if (eloDiff > rankedUser.eloDisparity || eloDiff > eloDisparity || rankedGame.rankedUsers.length >= Constants.MAX_PERSON_PLAYING) {
                return false;
            }
        }
        return true;
    }

    joinRoom(socket: io.Socket, rankedGame: RankedGame, user: User, eloDisparity: number) {
        socket.join(rankedGame.name + Constants.RANKED_SUFFIX);
        const rankedUser = new RankedUser(user, eloDisparity);
        this.rooms.get(rankedGame.name)?.rankedUsers.push(rankedUser);
    }

    createRoom(socket: io.Socket, user: User, eloDisparity: number) {
        const rankedUser = new RankedUser(user, eloDisparity);
        const rankedUsers: RankedUser[] = [rankedUser];
        const randomNumberMultiplicator = 1000;
        const randomNumber = Math.floor(Math.random() * randomNumberMultiplicator + 1);
        const rankedGame: RankedGame = new RankedGame(user.name + randomNumber.toString() + Constants.RANKED_SUFFIX, rankedUsers);
        this.rooms.set(rankedGame.name, rankedGame);
        socket.join(rankedGame.name + Constants.RANKED_SUFFIX);
    }

    rankedMatchFound(rankedGame: RankedGame, socket: io.Socket) {
        const twnetyOneSecondDelay = 0.35;
        this.sio.to(rankedGame.name + Constants.RANKED_SUFFIX).emit('matchFound');
        rankedGame.startTimer(twnetyOneSecondDelay);
        this.checkForUsersAccept(rankedGame, socket);
        rankedGame.matchFound = true;
    }
    onRefuse(socket: io.Socket, user: User) {
        for (const rankedGame of this.rooms.values()) {
            for (let i = 0; i < rankedGame.rankedUsers.length; i++) {
                if (rankedGame.rankedUsers[i].name === user.name) {
                    this.sio.sockets.sockets.get(socket.id)?.emit('closeModalOnRefuse');
                    rankedGame.rankedUsers.splice(i, 1);
                    socket.leave(rankedGame.name + Constants.RANKED_SUFFIX);
                }
            }
        }
    }
    onAccept(socket: io.Socket, user: User) {
        for (const users of this.rooms.values()) {
            for (const rankedUser of users.rankedUsers) {
                if (rankedUser.name === user.name) {
                    rankedUser.hasAccepted = true;
                    rankedUser.socketId = socket.id;
                }
            }
        }
    }
    checkForUsersAccept(rankedGame: RankedGame, socket: io.Socket) {
        const secondInterval = 1000;
        const fiveSecondDelay = 5;
        const timerInterval = setInterval(() => {
            if (rankedGame.secondsValue === fiveSecondDelay) {
                clearInterval(timerInterval);
                for (let i = 0; i < rankedGame.rankedUsers.length; ) {
                    if (rankedGame.rankedUsers[i].hasAccepted === false) {
                        this.sio.to(rankedGame.name + Constants.RANKED_SUFFIX).emit('closeModalOnRefuse');
                        rankedGame.clearTimer();
                        socket.leave(rankedGame.name + Constants.RANKED_SUFFIX);
                        rankedGame.rankedUsers.splice(i, 1);
                    } else {
                        rankedGame.rankedUsers[i].hasAccepted = false;
                        i++;
                    }
                }
                if (rankedGame.rankedUsers.length < Constants.MAX_PERSON_PLAYING) {
                    rankedGame.clearTimer();
                    this.sio.to(rankedGame.name + Constants.RANKED_SUFFIX).emit('closeModal');
                    rankedGame.matchFound = false;
                    return;
                }
                this.createRankedGame(rankedGame);
                this.rooms.delete(rankedGame.name);
            }
        }, secondInterval);
    }

    async createRankedGame(rankedGame: RankedGame) {
        const secondInterval = 1000;
        let firstPlayer: RankedUser = rankedGame.rankedUsers[0];
        firstPlayer = rankedGame.rankedUsers[0];
        for (const user of rankedGame.rankedUsers) {
            if (user.name === firstPlayer.name) {
                await this.sio.sockets.sockets.get(user.socketId)?.emit('createRankedGame', rankedGame.name, firstPlayer.name);
            }
        }
        const threeSecondDelay = 3;
        let i = threeSecondDelay;
        const timerInterval = setInterval(() => {
            if (rankedGame.secondsValue === i + 1) {
                if (rankedGame.rankedUsers[i].name !== firstPlayer.name) {
                    this.sio.sockets.sockets
                        .get(rankedGame.rankedUsers[i].socketId)
                        ?.emit('joinRankedRoom', rankedGame.name, rankedGame.rankedUsers[i].socketId);
                }
                if (i !== 0) {
                    i -= 1;
                }
            }
            if (rankedGame.secondsValue <= 0) {
                clearInterval(timerInterval);
                rankedGame.clearTimer();
                this.sio.sockets.sockets.get(firstPlayer.socketId)?.emit('startGame', rankedGame.name);
            }
        }, secondInterval);
    }

    removePlayerFromGame(socket: io.Socket, userName: string) {
        for (const rankedGame of this.rooms.values()) {
            for (let i = 0; i < rankedGame.rankedUsers.length; i++) {
                if (rankedGame.rankedUsers[i].name === userName) {
                    rankedGame.rankedUsers.splice(i, 1);
                    socket.leave(rankedGame.name + Constants.RANKED_SUFFIX);
                }
            }
        }
    }
}
