import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { BoardComponent } from '@app/components/board/board.component';
import { CommunicationBoxComponent } from '@app/components/communication-box/communication-box.component';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { StandRPComponent } from '@app/components/stand-rp/stand-rp.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { MultiplayerInitPageComponent } from '@app/pages/multiplayer-init-page/multiplayer-init-page.component';
import { ParametresSelectionPageComponent } from '@app/pages/parametres-selection-page/parametres-selection-page.component';
import { ModalVpLevelsComponent } from './components/modal-vp-levels/modal-vp-levels.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { LeaderboardPageComponent } from './pages/leaderboard-page/leaderboard-page.component';
import { ModalComponent } from './pages/modal/modal.component';

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
        PlayAreaComponent,
        SidebarComponent,
        MaterialPageComponent,
        BoardComponent,
        StandRPComponent,
        ParametresSelectionPageComponent,
        MultiplayerInitPageComponent,
        CommunicationBoxComponent,
        TimerComponent,
        InfoPanelComponent,
        LeaderboardPageComponent,
        AdminPageComponent,
        ModalComponent,
        ModalVpLevelsComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
