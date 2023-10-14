import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { CreateUserValidator } from '@app/utils/validators';
import { HttpException } from '@app/classes/http.exception';
import { DataStoredInToken, RequestWithUser, TokenData } from '@app/classes/auth.interface';
import { User } from '@app/classes/users.interface';
import userModel from '@app/models/users.model';
import { isEmpty } from '@app/utils/utils';
import UserService from '@app/services/user.service';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import { DEFAULT_VALUE_NUMBER, TOKEN_EXPIRATION, WEB_TOKEN_SECRET } from '@app/classes/global-constants';
import { addActionHistory } from '@app/utils/auth';

class AuthService {
    users = userModel;
    userService = new UserService();
    loggedInIds: string[] = [];

    async signup(userData: CreateUserValidator): Promise<User> {
        const newUser = await this.userService.createUser(userData);
        newUser.avatarUri = await this.userService.populateAvatarField(newUser);
        return newUser;
    }

    async login(userData: CreateUserValidator): Promise<{ cookie: string; findUser: User }> {
        if (isEmpty(userData)) throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no data sent');

        let findUser = await this.userService.findUserByEmail(userData.email);

        const isPasswordMatching: boolean = await compare(userData.password, findUser.password as string);
        if (!isPasswordMatching) throw new HttpException(HTTPStatusCode.NotFound, "You're password not matching");

        if (this.loggedInIds.indexOf(findUser.id as string) !== DEFAULT_VALUE_NUMBER)
            throw new HttpException(HTTPStatusCode.Conflict, 'Already logged in, log out of device and try again');

        this.loggedInIds.push(findUser.id as string);
        const tokenData = this.createToken(findUser);
        const cookie = this.createCookie(tokenData);
        findUser = (await this.users.findByIdAndUpdate(
            { _id: findUser.id },
            { $push: { actionHistory: addActionHistory('login') } },
            { new: true },
        )) as User;
        findUser.avatarUri = await this.userService.populateAvatarField(findUser);
        return { cookie, findUser };
    }

    async softLogin(req: RequestWithUser) {
        const requestUser = req.user;

        if (isEmpty(requestUser)) throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no data sent');

        let findUser = await this.userService.findUserByEmail(requestUser.email as string);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (this.loggedInIds.indexOf(findUser.id as string) === -1) this.loggedInIds.push(findUser.id as string);
        const tokenData = this.createToken(findUser);
        const cookie = this.createCookie(tokenData);
        findUser = (await this.users.findByIdAndUpdate(
            { _id: findUser.id },
            { $push: { actionHistory: addActionHistory('login') } },
            { new: true },
        )) as User;
        findUser.avatarUri = await this.userService.populateAvatarField(findUser);
        return { cookie, findUser };
    }

    async logout(id: string): Promise<void> {
        const filteredIds = this.loggedInIds.filter((_id) => _id !== id);
        const findUser = await this.userService.findUserById(id);
        await this.users.updateOne({ _id: findUser.id }, { $push: { actionHistory: addActionHistory('logout') } });
        this.loggedInIds = filteredIds;
    }

    createToken(user: User): TokenData {
        const dataStoredInToken: DataStoredInToken = { _id: user.id as string };
        const secretKey: string = WEB_TOKEN_SECRET;
        const expiresIn: number = TOKEN_EXPIRATION * TOKEN_EXPIRATION;

        return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
    }

    createCookie(tokenData: TokenData): string {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
    }
}

export default AuthService;
