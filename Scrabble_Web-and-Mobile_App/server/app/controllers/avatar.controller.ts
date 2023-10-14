import { NextFunction, Request, Response } from 'express';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import { Avatar } from '@app/classes/interfaces/avatar.interface';
import AvatarService from '@app/services/avatar.service';

/* eslint-disable no-invalid-this */

class AvatarController {
    avatarService = new AvatarService();

    getAllAvatars = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findAllAvatars: Avatar[] = await this.avatarService.findAllAvatars();
            res.status(HTTPStatusCode.OK).json({ data: findAllAvatars, message: 'findAll' });
        } catch (error) {
            next(error);
        }
    };

    getRandomAvatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const randomAvatar: string = await this.avatarService.getRandomAvatar();
            res.status(HTTPStatusCode.OK).json({ data: randomAvatar, message: 'randomAvatar' });
        } catch (error) {
            next(error);
        }
    };

    saveAvatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body;
            const avatarUri = body.avatarUri;
            const id = body.id;
            await this.avatarService.saveAvatarForUser(avatarUri, id);
            res.status(HTTPStatusCode.OK).json({ data: '', message: 'AvatarSaved' });
        } catch (error) {
            next(error);
        }
    };
}

export default AvatarController;
