import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { BoardStandComponent } from '@app/components/board-stand/board-stand.component';
import { CommunicationBoxComponent } from '@app/components/chat/communication-box/communication-box.component';
import { CommunicationDashboardComponent } from '@app/components/chat/communication-dashboard/communication-dashboard.component';
import { NewChatroomModalComponent } from '@app/components/chat/communication-dashboard/new-chatroom-modal/new-chatroom-modal.component';
import { JoinChatRoomModalComponent } from './components/chat/communication-dashboard/join-chatroom-modal.component.ts/join-chatroom-modal.component';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { MultiplayerInitPageComponent } from '@app/pages/multiplayer-init-page/multiplayer-init-page.component';
import { ParametresSelectionPageComponent } from '@app/pages/parametres-selection-page/parametres-selection-page.component';
import { RankedInitPageComponent } from '@app/pages/ranked-init-page/ranked-init-page.component';
import { RankedMatchmakingPageComponent } from '@app/pages/ranked-matchmaking-page/ranked-matchmaking-page.component';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { GalleryComponent } from './components/gallery/gallery.component';
import { UserHistoryComponent } from './components/user-history/user-history.component';
import { GameModeOptionsPageComponent } from './pages/game-mode-options-page/game-mode-options-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ModalComponent } from './pages/modal/modal.component';
import { ProfileEditComponent } from './pages/profile-page/profile-edit/profile-edit.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// eslint-disable-next-line import/no-unresolved
import { EndGameResultsPageComponent } from '@app/pages/end-game-results-page/end-game-results-page.component';
import { ProfileReadOnlyPageComponent } from '@app/pages/profile-page/profile-read-only-page/profile-read-only-page.component';
import { NgDisableLinkModule } from 'ng-disable-link';
import { ConfirmWindowComponent } from './components/confirm-window/confirm-window.component';
import { DARK_MODE_OPTIONS } from 'angular-dark-mode';

// eslint-disable-next-line @typescript-eslint/naming-convention,prefer-arrow/prefer-arrow-functions
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        BoardStandComponent,
        ParametresSelectionPageComponent,
        MultiplayerInitPageComponent,
        RankedInitPageComponent,
        RankedMatchmakingPageComponent,
        CommunicationBoxComponent,
        TimerComponent,
        InfoPanelComponent,
        ModalComponent,
        LoginPageComponent,
        GameModeOptionsPageComponent,
        ProfilePageComponent,
        UserHistoryComponent,
        ProfileEditComponent,
        GalleryComponent,
        EndGameResultsPageComponent,
        ProfileReadOnlyPageComponent,
        CommunicationDashboardComponent,
        NewChatroomModalComponent,
        JoinChatRoomModalComponent,
        ConfirmWindowComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule,
        NgxGalleryModule,
        NgDisableLinkModule,
        TranslateModule.forRoot({
            defaultLanguage: 'fr',
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
    ],
    providers: [
        {
            provide: DARK_MODE_OPTIONS,
            useValue: {
                darkModeClass: 'my-dark-mode',
                lightModeClass: 'my-light-mode',
            },
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
