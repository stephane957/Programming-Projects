// eslint-disable-next-line max-classes-per-file
import { IsEmail, IsString, ValidationError, validate, IsAlphanumeric } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RequestHandler } from 'express';
import { HttpException } from '@app/classes/http.exception';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';

export class CreateUserValidator {
    @IsEmail()
    email: string;

    @IsAlphanumeric()
    name: string;

    @IsString()
    password: string;

    @IsString()
    avatarPath: string;
}

export class LoginUserValidator {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class EmailValidator {
    @IsEmail()
    email: string;
}

/* export class CreateGameSavedValidator {
    @IsString()
    savedGameId: string;
}*/

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const validationMiddleware = (
    type: any,
    value: string | 'body' | 'query' | 'params' = 'body',
    skipMissingProperties = false,
    whitelist = true,
    forbidNonWhitelisted = true,
): RequestHandler => {
    return (req, res, next) => {
        // eslint-disable-next-line deprecation/deprecation
        validate(plainToClass(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
            if (errors.length > 0) {
                const message = errors.map((error: ValidationError) => Object.values(error.constraints as unknown as ArrayLike<string>)).join(', ');
                next(new HttpException(HTTPStatusCode.BadRequest, message));
            } else {
                next();
            }
        });
    };
};
/* eslint-enable  @typescript-eslint/no-explicit-any */
