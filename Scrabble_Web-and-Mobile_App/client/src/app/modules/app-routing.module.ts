import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameModeOptionsPageComponent } from '@app/pages/game-mode-options-page/game-mode-options-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { MultiplayerInitPageComponent } from '@app/pages/multiplayer-init-page/multiplayer-init-page.component';
import { ParametresSelectionPageComponent } from '@app/pages/parametres-selection-page/parametres-selection-page.component';
import { ProfilePageComponent } from '@app/pages/profile-page/profile-page.component';
import { RankedInitPageComponent } from '@app/pages/ranked-init-page/ranked-init-page.component';
import { RankedMatchmakingPageComponent } from '@app/pages/ranked-matchmaking-page/ranked-matchmaking-page.component';
import { CommunicationDashboardComponent } from '@app/components/chat/communication-dashboard/communication-dashboard.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'param-select', component: ParametresSelectionPageComponent },
    { path: 'multiplayer-init', component: MultiplayerInitPageComponent },
    { path: 'chat-rooms/:socketId', component: CommunicationDashboardComponent },
    { path: 'ranked-init', component: RankedInitPageComponent },
    { path: 'ranked-matchmaking', component: RankedMatchmakingPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'game-mode-options', component: GameModeOptionsPageComponent },
    { path: 'profile', component: ProfilePageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
