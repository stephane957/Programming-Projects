export class RoomData {
    name: string;
    timeTurn: string;
    isBonusRandom: boolean;
    isLog2990Enabled: boolean;

    constructor(name: string, timeTurn: string, isBonusRandom: boolean, isLog2990Enabled: boolean) {
        this.name = name;
        this.timeTurn = timeTurn;
        this.isBonusRandom = isBonusRandom;
        this.isLog2990Enabled = isLog2990Enabled;
    }
}
