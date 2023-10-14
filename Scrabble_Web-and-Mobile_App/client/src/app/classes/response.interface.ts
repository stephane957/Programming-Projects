import { User } from '@app/classes/user.interface';

export interface UserResponseInterface {
    data: User;
    message: string;
}
