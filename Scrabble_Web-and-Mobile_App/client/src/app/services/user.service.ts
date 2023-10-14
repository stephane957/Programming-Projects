/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameSaved } from '@app/classes/game-saved';
import { UserResponseInterface } from '@app/classes/response.interface';
import { User } from '@app/classes/user.interface';
import { InfoClientService } from '@app/services/info-client.service';
import { TranslateService } from '@ngx-translate/core';
import { DarkModeService } from 'angular-dark-mode';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user: User;
    serverUrl = environment.serverUrl;

    constructor(
        private http: HttpClient,
        private infoClientService: InfoClientService,
        private router: Router,
        private notifService: NotificationService,
        private translate: TranslateService,
        private themeService: DarkModeService,
    ) {}

    getUser(user: User): Observable<UserResponseInterface> {
        return this.http.get<UserResponseInterface>(`${environment.serverUrl}users/${user._id}`);
    }

    updateUserInstance(user: User) {
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(user));
        this.user = user;
    }

    getCookieHeader(): HttpHeaders {
        return new HttpHeaders().set('Authorization', localStorage.getItem('cookie')?.split('=')[1].split(';')[0] as string);
    }

    async signUp(name: string, email: string, password: string, avatarPath: string, socket: Socket) {
        this.http
            .post<unknown>(this.serverUrl + 'signup', {
                name,
                email,
                password,
                avatarPath,
            })
            // eslint-disable-next-line deprecation/deprecation
            .subscribe({
                next: () => {
                    this.http
                        .post<unknown>(this.serverUrl + 'login', {
                            email,
                            password,
                        })
                        // eslint-disable-next-line deprecation/deprecation
                        .subscribe({
                            next: (response) => {
                                this.saveUserInfo(response, socket);
                            },
                            error: (error) => {
                                this.handleErrorPOST(error);
                            },
                        });
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async signIn(email: string, password: string, socket: Socket) {
        this.http
            .post<any>(this.serverUrl + 'login', {
                email,
                password,
            })
            // eslint-disable-next-line deprecation/deprecation
            .subscribe({
                next: (response) => {
                    this.saveUserInfo(response, socket);
                    socket.emit('getAllAvatars');
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async softLogin(socket: Socket) {
        this.http
            .post<unknown>(
                environment.serverUrl + 'soft-login',
                {},
                {
                    headers: this.getCookieHeader(),
                },
            )
            // eslint-disable-next-line deprecation/deprecation
            .subscribe({
                next: (response) => {
                    this.saveUserInfo(response, socket);
                    socket.emit('getAllAvatars');
                },
            });
    }

    async logout() {
        this.http
            .post<unknown>(
                environment.serverUrl + 'logout',
                {},
                {
                    headers: this.getCookieHeader(),
                },
            )
            // eslint-disable-next-line deprecation/deprecation
            .subscribe({
                next: () => {
                    // @ts-ignore
                    localStorage.removeItem('cookie');
                    localStorage.removeItem('user');
                    this.infoClientService.playerName = 'DefaultPlayerName';
                    this.themeService?.disable();
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async updateUsername(newName: string) {
        return this.http
            .put<UserResponseInterface>(
                environment.serverUrl + 'users/' + this.user._id,
                {
                    name: newName,
                },
                {
                    headers: this.getCookieHeader(),
                },
            )
            .subscribe({
                next: (res) => {
                    this.updateUserInstance(res.data);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async updateAvatar(newAvatarIndex: number, socket: Socket) {
        return this.http
            .put<UserResponseInterface>(
                environment.serverUrl + 'users/' + this.user._id,
                {
                    avatarPath: `avatar${newAvatarIndex + 1}`,
                },
                {
                    headers: this.getCookieHeader(),
                },
            )
            .subscribe({
                next: (res) => {
                    this.updateUserInstance(res.data);
                    this.infoClientService.userAvatars.set(this.user.name, this.user.avatarUri as string);
                    socket.emit('updatedAvatar', this.user.name);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async updateFavourites(idOfGame: string) {
        return this.http
            .patch<UserResponseInterface>(
                environment.serverUrl + 'users/' + this.user._id,
                { gameId: idOfGame },
                {
                    headers: this.getCookieHeader(),
                },
            )
            .subscribe({
                next: (res) => {
                    this.updateUserInstance(res.data);
                    this.notifService.openSnackBar('La partie a été ajoutée à vos favoris', true);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    getFavouriteGames() {
        return this.http.get<GameSaved[]>(environment.serverUrl + 'users/games/' + this.user._id, { observe: 'body' });
    }

    getUserByName(playerName: string): Observable<UserResponseInterface> {
        return this.http.get<UserResponseInterface>(`${this.serverUrl}users/${playerName}`, {
            observe: 'body',
            responseType: 'json',
        });
    }

    async updateLanguage(languageUpdated: string) {
        return this.http
            .put<UserResponseInterface>(
                environment.serverUrl + 'users/language/' + this.user._id,
                { language: languageUpdated },
                {
                    headers: this.getCookieHeader(),
                },
            )
            .subscribe({
                next: (res) => {
                    // eslint-disable-next-line no-console
                    console.log(res);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async updateTheme(themeUpdated: string) {
        return this.http
            .put<UserResponseInterface>(
                environment.serverUrl + 'users/theme/' + this.user._id,
                { theme: themeUpdated },
                {
                    headers: this.getCookieHeader(),
                },
            )
            .subscribe({
                next: (res) => {
                    // eslint-disable-next-line no-console
                    console.log(res);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    private handleErrorPOST(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            this.notifService.openSnackBar('Erreur: ' + error.status + error.error.message, false);
        } else {
            this.notifService.openSnackBar(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.message}`, false);
        }
    }

    private saveUserInfo(response: any, socket: Socket) {
        localStorage.setItem('cookie', response.token);
        this.updateUserInstance(response.data);
        socket.emit('new-user', response.data.name);
        setTimeout(() => {
            this.translate.use(response.data.language);
            if (response.data.theme.toLowerCase() === 'dark') {
                this.themeService?.enable();
            } else {
                this.themeService?.disable();
            }
            this.infoClientService.playerName = response.data.name;
            this.router.navigate(['/game-mode-options']);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 500);
    }
}
