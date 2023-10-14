import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserHistoryComponent } from '@app/components/user-history/user-history.component';
import { UserService } from '@app/services/user.service';
import { ProfileEditComponent } from '@app/pages/profile-page/profile-edit/profile-edit.component';
import { Subscription } from 'rxjs';
import { GameSaved } from '@app/classes/game-saved';
import { TranslateService } from '@ngx-translate/core';
import { SocketService } from '@app/services/socket.service';
import { DarkModeService } from 'angular-dark-mode';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
    favourtieGamesSubscription: Subscription;
    favouriteGames: GameSaved[];
    langList: string[];
    langSelected: string | undefined;
    themeList: string[];
    themeSelected: string | undefined;

    langMap = new Map<string, string>([
        ['Français', 'fr'],
        ['English', 'en'],
    ]);

    inverseLangMap = new Map<string, string>([
        ['fr', 'Français'],
        ['en', 'English'],
    ]);

    constructor(
        private dialog: MatDialog,
        public userService: UserService,
        private translate: TranslateService,
        private themeService: DarkModeService,
        private socketService: SocketService,
    ) {}

    ngOnInit() {
        this.favourtieGamesSubscription = this.userService.getFavouriteGames().subscribe((res: GameSaved[]) => {
            this.favouriteGames = res.copyWithin(0, 0);
        });
        this.langList = ['Français', 'English'];
        this.langSelected = this.inverseLangMap.get(this.translate.currentLang);
        this.themeList = ['Light', 'Dark'];
        this.themeService?.darkMode$?.subscribe((data) => {
            if (data) {
                this.themeSelected = 'Dark';
            } else {
                this.themeSelected = 'Light';
            }
        });
    }

    ngOnDestroy() {
        this.favourtieGamesSubscription.unsubscribe();
    }

    roundNum(num: number | undefined): number | undefined {
        if (!num) {
            return num;
        }
        const oneHundred = 100;
        return Math.round(num * oneHundred) / oneHundred;
    }

    openActionHistoryComponent(): void {
        this.dialog.open(UserHistoryComponent, {
            height: '75%',
            width: '75%',
            data: {
                title: this.translate.instant('PROFILE.HISTORY_CONNECTIONS'),
                data: this.userService.user.actionHistory,
                isFavouriteGames: false,
            },
            panelClass: 'matDialogWheat',
        });
    }

    openGameHistoryComponent(): void {
        this.dialog.open(UserHistoryComponent, {
            height: '75%',
            width: '75%',
            data: {
                title: this.translate.instant('PROFILE.HISTORY_GAMES'),
                data: this.userService.user.gameHistory,
                isFavouriteGames: false,
            },
            panelClass: 'matDialogWheat',
        });
    }

    openFavouriteGamesComponent(): void {
        this.dialog.open(UserHistoryComponent, {
            height: '75%',
            width: '60%',
            data: {
                title: this.translate.instant('PROFILE.FAVORITES'),
                data: this.favouriteGames,
                isFavouriteGames: true,
            },
            panelClass: 'matDialogWheat',
        });
    }

    openEditProfileComponent(): void {
        this.dialog.open(ProfileEditComponent, {
            height: '90%',
            width: '25%',
            panelClass: 'matDialogWheat',
        });
    }

    millisToMinutesAndSeconds() {
        const date = new Date(this.userService.user.averageTimePerGame as number);
        const m = date.getMinutes();
        const s = date.getSeconds();
        return `${m}m:${s}s.`;
    }

    onClickLang(lang: string): void {
        const language = this.langMap.get(lang) as string;
        this.userService.updateLanguage(language);
        this.socketService.socket.emit('changeLanguage', this.userService.user.name, language);
        this.translate.use(language);
    }

    onClickTheme(): void {
        if (this.themeSelected === 'Dark') {
            this.themeService.enable();
        } else {
            this.themeService.disable();
        }
        this.userService.updateTheme((this.themeSelected as string).toLowerCase());
    }
}
