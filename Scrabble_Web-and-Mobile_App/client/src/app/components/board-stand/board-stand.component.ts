/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { ChatMessage } from '@app/classes/chat-message';
import * as Constants from '@app/classes/global-constants';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { NotificationService } from '@app/services/notification.service';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmWindowComponent } from '@app/components/confirm-window/confirm-window.component';

@Component({
    selector: 'app-board-stand',
    templateUrl: './board-stand.component.html',
    styleUrls: ['./board-stand.component.scss'],
})
export class BoardStandComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('canvasPlayArea', { static: false }) playAreaElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('tmpTileCanvas', { static: false }) tmpTileElement!: ElementRef<HTMLCanvasElement>;
    playAreaCanvas: CanvasRenderingContext2D;
    tmpTileCanvas: CanvasRenderingContext2D;
    playAreaConvasSize: Vec2 = { x: Constants.DEFAULT_WIDTH_PLAY_AREA, y: Constants.DEFAULT_WIDTH_PLAY_AREA };
    isMouseDown: boolean = false;
    savedCoordsClick: Vec2 = { x: 0, y: 0 };
    clickedTile: Tile | undefined;
    // used to keep track of the original position of the tile when taken from board
    clickedTileIndex: Vec2 = new Vec2();
    // buffer used to reduce the number of emit to the server
    bufferMouseEvent: number = 0;
    lastBoardIndexsHover: Vec2 = new Vec2();
    displayLetterChoiceModal: string;
    letterChoice: string = '';

    routerSubscription: Subscription;

    constructor(
        private drawingBoardService: DrawingBoardService,
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        private placeGraphicService: PlaceGraphicService,
        private socketService: SocketService,
        public infoClientService: InfoClientService,
        private route: Router,
        private notifService: NotificationService,
        private dialog: MatDialog,
        private router: Router,
        private translate: TranslateService,
    ) {}

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeKeydownHandler(event: KeyboardEvent) {
        this.mouseKeyboardEventHandler.handleKeyboardEvent(event);
    }

    @HostListener('document:keydown.backspace', ['$event'])
    onBackspaceKeydownHandler(event: KeyboardEvent) {
        this.mouseKeyboardEventHandler.handleKeyboardEvent(event);
    }

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.mouseKeyboardEventHandler.handleKeyboardEvent(event);
    }

    @HostListener('document:keyup.arrowright', ['$event'])
    @HostListener('document:keyup.arrowleft', ['$event'])
    handleArrowEvent(event: KeyboardEvent) {
        this.mouseKeyboardEventHandler.handleArrowEvent(event);
    }

    @HostListener('document:mousewheel', ['$event'])
    handleScrollEvent(event: WheelEvent) {
        this.mouseKeyboardEventHandler.handleScrollEvent(event);
    }

    @HostListener('document:mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.isMouseDown = true;
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };
        if (this.areCoordsOnStand(coordsClick)) {
            this.clickedTile = this.mouseKeyboardEventHandler.onMouseDownGetStandTile(event);
        } else if (this.areCoordsOnBoard(coordsClick)) {
            this.clickedTile = this.mouseKeyboardEventHandler.onMouseDownGetBoardTile(event);
            this.clickedTileIndex = this.drawingBoardService.getIndexOnBoardLogicFromClick(coordsClick);
        }
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        this.isMouseDown = false;
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };
        // we don't want to clear if the method is with arrows because the arrows will disppear
        if (this.placeGraphicService.drapDropEnabled()) {
            this.socketService.socket.emit('clearTmpTileCanvas');
        }
        if (this.areCoordsOnBoard(coordsClick) && this.infoClientService.isTurnOurs) {
            // if we have a tile selected we process it
            if (this.clickedTile && this.clickedTile?.letter.value !== '' && this.placeGraphicService.drapDropEnabled()) {
                if (this.placeGraphicService.tileClickedFromStand) {
                    // if the tile from the stand is a star we display the modal to ask for which letter to use
                    // we save the coords of the click and return
                    if (this.clickedTile.letter.value === '*') {
                        this.savedCoordsClick = coordsClick;
                        this.displayLetterChoiceModal = 'block';
                        return;
                    }
                    this.mouseKeyboardEventHandler.onStandToBoardDrop(coordsClick, this.clickedTile, this.letterChoice);
                } else {
                    this.mouseKeyboardEventHandler.onBoardToBoardDrop(coordsClick, this.clickedTile);
                }
            } else {
                // else we just consider it as a click on the board
                this.mouseKeyboardEventHandler.onBoardClick(event);
            }
        } else if (this.areCoordsOnStand(coordsClick)) {
            if (
                this.clickedTile &&
                this.clickedTile?.letter.value !== '' &&
                !this.placeGraphicService.tileClickedFromStand &&
                this.placeGraphicService.drapDropEnabled() &&
                this.infoClientService.isTurnOurs
            ) {
                this.mouseKeyboardEventHandler.onBoardToStandDrop(coordsClick, this.clickedTile, this.clickedTileIndex);
            } else {
                if (event.button === Constants.LEFT_CLICK) {
                    this.mouseKeyboardEventHandler.onLeftClickStand(event);
                } else if (event.button === Constants.RIGHT_CLICK) {
                    this.mouseKeyboardEventHandler.onRightClickStand(event);
                }
            }
        }

        // if the modal to choose the letter is open we don't reset the variables
        if (this.displayLetterChoiceModal !== 'block') {
            this.clickedTile = undefined;
            this.clickedTileIndex = new Vec2();
        }
    }

    ngOnInit() {
        this.infoClientService.hasAskedForLeave = false;
        // we weren't able to find an equivalent without using subscribe
        // nothing was working for this specific case
        // pages are handled differently and it doesn't fit our feature
        // TODO find a way to do it better
        // eslint-disable-next-line deprecation/deprecation
        this.routerSubscription = this.router.events.subscribe((event) => {
            const isAtCorrectPage: boolean = event instanceof NavigationStart && this.router.url === '/game';
            if (
                isAtCorrectPage &&
                !this.infoClientService.game.gameFinished &&
                !this.infoClientService.isSpectator &&
                !this.infoClientService.hasAskedForLeave
            ) {
                const dialogRef = this.dialog.open(ConfirmWindowComponent, {
                    height: '25%',
                    width: '20%',
                    panelClass: 'matDialogWheat',
                });
                if (this.infoClientService.game.gameFinished || !this.infoClientService.game.gameStarted) {
                    dialogRef.componentInstance.name = this.translate.instant('GAME.DO_YOU_WANT_QUIT');
                } else {
                    dialogRef.componentInstance.name = this.translate.instant('GAME.DO_YOU_WANT_QUIT_ABANDON');
                }

                dialogRef.afterClosed().subscribe((result) => {
                    if (result) {
                        this.socketService.socket.emit('giveUpGame');
                        this.routerSubscription.unsubscribe();
                        this.router.navigate(['/game-mode-options']);
                        this.infoClientService.hasAskedForLeave = true;
                    } else {
                        this.router.navigate(['/game']);
                    }
                });
            }
            if (!this.infoClientService.hasAskedForLeave) {
                this.router.navigate(['/game']);
            }
        });
    }

    ngOnDestroy() {
        this.routerSubscription.unsubscribe();
    }

    ngAfterViewInit(): void {
        if (this.route.url === '/game') {
            this.infoClientService.chatRooms.unshift({
                name: 'game',
                participants: [],
                creator: '',
                chatHistory: [new ChatMessage('SYSTEM', 'Bienvenue sur le channel de discussion de la partie.')],
            });
        } else {
            // if the user is not in a game there is no game chat
            const idxGameRoom = this.infoClientService.chatRooms.findIndex((chatRoom) => chatRoom.name === 'game');
            if (idxGameRoom !== Constants.DEFAULT_VALUE_NUMBER) {
                this.infoClientService.chatRooms.splice(idxGameRoom, 1);
            }
        }

        this.infoClientService.currSelectedChatroom = this.infoClientService.chatRooms[0];

        this.playAreaCanvas = this.playAreaElement.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.tmpTileCanvas = this.tmpTileElement.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingBoardService.canvasInit(this.playAreaCanvas, this.tmpTileCanvas);
        // add event lisntener for mouse movement
        // bind the component with the function to get acess to the attributes and functions of this component
        document.getElementById('tmpTileCanvas')?.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
        // reset the variable of each service used for the placement
        this.drawingBoardService.initDefaultVariables();
        this.placeGraphicService.initDefaultVariables();
        this.mouseKeyboardEventHandler.initDefaultVariables();
    }

    continueProcessingDrop() {
        if (!this.infoClientService.isTurnOurs) {
            this.clickedTile = undefined;
            this.clickedTileIndex = new Vec2();

            this.notifService.openSnackBar("Ce n'est plus votre tour de jouer !", false);
            return;
        }
        if (!this.allLetter(this.letterChoice)) {
            this.notifService.openSnackBar('Votre choix doit être une lettre ! Veuillez réessayer.', false);
            return;
        }
        if (!this.clickedTile || this.letterChoice === '') {
            return;
        }

        this.mouseKeyboardEventHandler.onStandToBoardDrop(this.savedCoordsClick, this.clickedTile, this.letterChoice);
        this.displayLetterChoiceModal = 'none';
        this.letterChoice = '';
    }

    playerNameDynamic(position: string) {
        const nbOfPlayers = 4;

        // u will love the next part :)))
        const one = 1;
        const two = 2;
        const three = 3;
        const oneHundredFiftheen = 115;

        const defaultH1FontSize = 32;
        const maxSizeNameBox = 160;

        let idxInterestingPlayer = 0;
        if (this.infoClientService.isSpectator) {
            idxInterestingPlayer = this.infoClientService.game.idxPlayerPlaying;
        } else {
            idxInterestingPlayer = this.infoClientService.actualRoom.players.findIndex((player) => player.name === this.infoClientService.playerName);
        }

        switch (position) {
            case 'T': {
                const player = this.infoClientService.actualRoom.players[(idxInterestingPlayer + two) % nbOfPlayers];
                const nameElement = document.getElementById('playerT');
                if (!player || !nameElement) {
                    return '';
                }
                nameElement.innerHTML = player.name;
                if (nameElement.clientWidth > maxSizeNameBox) {
                    nameElement.style.fontSize = defaultH1FontSize / (nameElement.clientWidth / oneHundredFiftheen) + 'px';
                }
                return player.name;
            }
            case 'B': {
                const player1 = this.infoClientService.actualRoom.players[idxInterestingPlayer % nbOfPlayers];
                const nameElement1 = document.getElementById('playerB');
                if (!player1 || !nameElement1) {
                    return '';
                }
                nameElement1.innerHTML = player1.name;
                if (nameElement1.clientWidth > maxSizeNameBox) {
                    nameElement1.style.fontSize = defaultH1FontSize / (nameElement1.clientWidth / oneHundredFiftheen) + 'px';
                }
                return player1.name;
            }
            case 'L': {
                const player2 = this.infoClientService.actualRoom.players[(idxInterestingPlayer + one) % nbOfPlayers];
                const nameElement2 = document.getElementById('playerL');
                if (!player2 || !nameElement2) {
                    return '';
                }
                nameElement2.innerHTML = player2.name;
                if (nameElement2.clientWidth > maxSizeNameBox) {
                    nameElement2.style.fontSize = defaultH1FontSize / (nameElement2.clientWidth / oneHundredFiftheen) + 'px';
                }
                return player2.name;
            }
            case 'R': {
                const player3 = this.infoClientService.actualRoom.players[(idxInterestingPlayer + three) % nbOfPlayers];
                const nameElement3 = document.getElementById('playerR');
                if (!player3 || !nameElement3) {
                    return '';
                }
                nameElement3.innerHTML = player3.name;
                if (nameElement3.clientWidth > maxSizeNameBox) {
                    nameElement3.style.fontSize = defaultH1FontSize / (nameElement3.clientWidth / oneHundredFiftheen) + 'px';
                }
                return player3.name;
            }
            default: {
                return 'defaultName';
            }
        }
    }

    private allLetter(txt: string): boolean {
        const letters = /^[A-Za-z]+$/;
        if (txt.match(letters)) {
            return true;
        } else {
            return false;
        }
    }

    private handleMouseMove(event: MouseEvent) {
        if (!this.isMouseDown || !this.clickedTile || this.clickedTile?.letter.value === '' || !this.infoClientService.isTurnOurs) {
            return;
        }
        // if we have some letter placed on the board and this is by keyboard not drag and drop
        // we leave bc the two methods of placement are not compatible (they are but the exigences doesn't want it)
        if (!this.placeGraphicService.drapDropEnabled()) {
            return;
        }

        const mouseCoords: Vec2 = { x: event.offsetX, y: event.offsetY };
        this.socketService.socket.emit('tileDraggedOnCanvas', this.clickedTile, mouseCoords);
    }

    private areCoordsOnBoard(coords: Vec2): boolean {
        const posXYStartForBoard = Constants.PADDING_BOARD_FOR_STANDS + Constants.SIZE_OUTER_BORDER_BOARD;
        const posXYEndForBoard = posXYStartForBoard + Constants.DEFAULT_WIDTH_BOARD - 2 * Constants.SIZE_OUTER_BORDER_BOARD;
        if (coords.x > posXYStartForBoard && coords.x < posXYEndForBoard && coords.y > posXYStartForBoard && coords.y < posXYEndForBoard) {
            return true;
        } else {
            return false;
        }
    }

    private areCoordsOnStand(coords: Vec2): boolean {
        const paddingForStands = Constants.DEFAULT_HEIGHT_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        const posXForStands =
            paddingForStands + Constants.SIZE_OUTER_BORDER_STAND + Constants.DEFAULT_WIDTH_BOARD / 2 - Constants.DEFAULT_WIDTH_STAND / 2;
        const posYForStands =
            Constants.DEFAULT_WIDTH_BOARD + paddingForStands + Constants.SIZE_OUTER_BORDER_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        if (
            coords.x > posXForStands &&
            coords.x < posXForStands + Constants.DEFAULT_WIDTH_STAND - Constants.SIZE_OUTER_BORDER_STAND * 2 &&
            coords.y > posYForStands &&
            coords.y < posYForStands + Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND * 2
        ) {
            return true;
        } else {
            return false;
        }
    }
}
