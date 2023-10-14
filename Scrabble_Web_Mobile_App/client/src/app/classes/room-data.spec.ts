import { RoomData } from './room-data';

describe('GameServer', () => {
    const roomData: RoomData = new RoomData('test', '1', false, true);

    it('should be created', () => {
        expect(roomData).toBeTruthy();
    });
});
