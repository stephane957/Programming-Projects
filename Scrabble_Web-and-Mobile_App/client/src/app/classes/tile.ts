import { Letter } from '@app/classes/letter';
import { Vec4 } from '@app/classes/vec4';
export class Tile {
    position: Vec4;
    letter: Letter;
    bonus: string | undefined;
    old: boolean;
    backgroundColor: string;
    borderColor: string;
    isOnBoard: boolean;

    constructor() {
        this.position = new Vec4();
        this.letter = new Letter();
        this.bonus = '';
        this.old = false;
        this.backgroundColor = '#F7F7E3';
        this.borderColor = '#212121';
        this.isOnBoard = false;
    }
}
