import { Avatar } from '@app/classes/interfaces/avatar.interface';
import * as fs from 'fs';
import * as path from 'path';

const PREFIX_URL = 'data:image/png;base64,';
const DEFAULT_AVATAR_COUNT = 8;

class AvatarService {
    assetDir = path.join(__dirname, '..', '..', 'assets', 'avatars');

    async findAllAvatars(): Promise<Avatar[]> {
        const avatars: Avatar[] = [];
        for (let i = 1; i <= DEFAULT_AVATAR_COUNT; i++) {
            const filePath = `${this.assetDir}/avatar${i}.png`;
            const file = fs.readFileSync(filePath);
            const fileURL = PREFIX_URL.concat(file.toString('base64'));
            avatars.push({
                uri: fileURL,
                path: filePath,
            });
        }
        return avatars;
    }

    async findAvatarByPath(avatarPath: string, id: string): Promise<string> {
        let filePath = '';

        if (avatarPath === 'customAvatar') {
            if (fs.existsSync(`${this.assetDir}/${id}.jpg`)) {
                filePath = `${this.assetDir}/${id}.jpg`;
            } else {
                filePath = `${this.assetDir}/avatar1.png`;
            }
        } else filePath = `${this.assetDir}/${avatarPath}.png`;

        const file = fs.readFileSync(filePath);
        return PREFIX_URL.concat(file.toString('base64'));
    }

    async getRandomAvatar(): Promise<string> {
        const randomNumber = Math.floor(Math.random() * DEFAULT_AVATAR_COUNT) + 1;
        const filePath = `${this.assetDir}/avatar${randomNumber}.png`;
        const file = fs.readFileSync(filePath);
        return PREFIX_URL.concat(file.toString('base64'));
    }

    async saveAvatarForUser(avatarUri: string, id: string): Promise<void> {
        if (id !== '') {
            const formattedUri = avatarUri.replace(/^data:image\/png;base64,/, '');
            fs.writeFileSync(`${this.assetDir}/${id}.jpg`, formattedUri, 'base64');
        }
    }
}

export default AvatarService;
