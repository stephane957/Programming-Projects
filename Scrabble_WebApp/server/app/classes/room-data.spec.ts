import { expect } from 'chai';
import { RoomData } from './room-data';

describe('GameServer', () => {
    const roomData: RoomData = new RoomData('test', '1', false);

    it('should be created', () => {
        expect(roomData).to.equal(roomData);
    });
});
