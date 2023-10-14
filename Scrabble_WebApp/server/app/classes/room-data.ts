export class RoomData {
    name: string;
    timeTurn: string;
    isBonusRandom: boolean;

    constructor(name: string, timeTurn: string, isBonusRandom: boolean) {
        this.name = name;
        this.timeTurn = timeTurn;
        this.isBonusRandom = isBonusRandom;
    }
}
