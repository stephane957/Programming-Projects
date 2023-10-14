import { User } from './users.interface';

export class RankedUser {
    elo: number;
    eloDisparity: number;
    name: string;
    hasAccepted: boolean = false;
    socketId: string = '';
    constructor(user: User, eloDisparity: number) {
        if (user.elo === undefined) {
            this.elo = 2000;
        } else {
            this.elo = user.elo;
        }
        this.name = user.name;
        this.eloDisparity = eloDisparity;
    }
}
