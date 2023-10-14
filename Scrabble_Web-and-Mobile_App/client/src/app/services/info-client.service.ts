import { Injectable } from '@angular/core';
import { ChatRoom } from '@app/classes/chatroom.interface';
import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
import { RoomData } from '@app/classes/room-data';
import { TranslateService } from '@ngx-translate/core';
import { TimerService } from './timer.service';

@Injectable({
    providedIn: 'root',
})
export class InfoClientService {
    game: GameServer;
    player: Player;

    gameMode: string;
    eloDisparity: number;

    // Game parameters
    minutesByTurn: number;
    playerName: string;
    isGamePrivate: boolean;

    // The string displayed in the info pannel
    nameVP1dictionary0: number;
    dictionaries: MockDict[];
    nameVPBeginner: NameVP[];
    nameVPExpert: NameVP[];

    displayTurn: string;
    isTurnOurs: boolean;

    rooms: RoomData[];
    // this old the array of players and spectators in the room
    // it is not in "game" object bc it is stored as maps which canned be sent to the client
    // and we use the players/spectators array to display the players/spectators in the room
    // when on the multiplayer page
    actualRoom: RoomData;

    letterBank: Map<string, LetterData>;
    letterReserve: string[];

    // useful to know to hide stands or not
    isSpectator: boolean;

    creatorShouldBeAbleToStartGame: boolean;

    // variables used when player wants to join a private game
    incommingPlayer: string;
    incommingPlayerId: string;

    // variable used for the power-cards feature
    powerUsedForTurn: boolean;
    displayPowerModal: string;
    displayExchStandModal: string;
    displayExchLetterModal: string;
    displayTransformTileModal: string;

    // variable used for the chat rooms
    chatRooms: ChatRoom[];
    currSelectedChatroom: ChatRoom;

    // variable to allow/block sound effects
    soundDisabled: boolean;
    userAvatars: Map<string, string>;

    // variable used to know if the user left the game or not
    hasAskedForLeave: boolean;

    constructor(private translate: TranslateService, private timerService: TimerService) {
        this.gameMode = Constants.CLASSIC_MODE;
        this.minutesByTurn = 1;
        this.isGamePrivate = false;
        this.playerName = 'DefaultPlayerName';
        this.incommingPlayer = '';
        this.incommingPlayerId = '';
        this.rooms = [];
        this.chatRooms = [];
        this.userAvatars = new Map();
        this.initializeService();
    }

    // public bc it is reused to reset for new games
    initializeService() {
        this.game = new GameServer(0, Constants.CLASSIC_MODE, 'defaultRoom', false, '');
        this.player = new Player('DefaultPlayerName', false);
        this.displayTurn = this.translate.instant('GAME.SIDEBAR.WAITING_PLAYERS');
        this.isTurnOurs = false;
        this.nameVP1dictionary0 = 0;
        this.isSpectator = false;
        this.creatorShouldBeAbleToStartGame = false;
        this.actualRoom = new RoomData('default', 'classic', '1', 'fake', [], []);
        this.powerUsedForTurn = false;
        this.displayPowerModal = 'none';
        this.displayExchStandModal = 'none';
        this.displayExchLetterModal = 'none';
        this.displayTransformTileModal = 'none';
        this.soundDisabled = false;
        this.hasAskedForLeave = false;
        this.timerService.displayTimer = this.translate.instant('GAME.TIMER_SERVICE.TIME_LEFT') + '1:00';
        this.timerService.clearTimer();
        this.currSelectedChatroom = { name: 'default', participants: [], creator: 'fake', chatHistory: [] };

        this.letterReserve = ['a', 'b'];
        this.letterBank = new Map([
            ['A', { quantity: 9, weight: 1 }],
            ['B', { quantity: 2, weight: 3 }],
            ['C', { quantity: 2, weight: 3 }],
            ['D', { quantity: 3, weight: 2 }],
            ['E', { quantity: 15, weight: 1 }],
            ['F', { quantity: 2, weight: 4 }],
            ['G', { quantity: 2, weight: 2 }],
            ['H', { quantity: 2, weight: 4 }],
            ['I', { quantity: 8, weight: 1 }],
            ['J', { quantity: 1, weight: 8 }],
            ['K', { quantity: 1, weight: 10 }],
            ['L', { quantity: 5, weight: 1 }],
            ['M', { quantity: 3, weight: 2 }],
            ['N', { quantity: 6, weight: 1 }],
            ['O', { quantity: 6, weight: 1 }],
            ['P', { quantity: 2, weight: 3 }],
            ['Q', { quantity: 1, weight: 8 }],
            ['R', { quantity: 6, weight: 1 }],
            ['S', { quantity: 6, weight: 1 }],
            ['T', { quantity: 6, weight: 1 }],
            ['U', { quantity: 6, weight: 1 }],
            ['V', { quantity: 2, weight: 4 }],
            ['W', { quantity: 1, weight: 10 }],
            ['X', { quantity: 1, weight: 10 }],
            ['Y', { quantity: 1, weight: 10 }],
            ['Z', { quantity: 1, weight: 10 }],
            ['*', { quantity: 2, weight: 0 }],
        ]);
        // If gameMode === 'Solo' alors we use the following functions for the VP
        this.nameVPBeginner = [];
        this.nameVPExpert = [];
        this.dictionaries = [];
    }
}
