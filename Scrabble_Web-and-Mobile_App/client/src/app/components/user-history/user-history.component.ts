import { AfterViewInit, Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { GameSaved } from '@app/classes/game-saved';
import { TranslateService } from '@ngx-translate/core';

interface Data {
    title: string;
    data: string[];
    isFavouriteGames: boolean;
}
interface Games {
    title: string;
    data: GameSaved[];
    isFavouriteGames: boolean;
}

@Component({
    selector: 'app-user-history',
    templateUrl: './user-history.component.html',
    styleUrls: ['./user-history.component.scss'],
})
export class UserHistoryComponent implements AfterViewInit, OnInit {
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    @ViewChildren('commands') itemElements: QueryList<Element>;

    // eslint-disable-next-line no-invalid-this
    actionHistory: string[] = this.data.data as string[];
    // eslint-disable-next-line no-invalid-this
    favouriteGames: GameSaved[];
    private scrollContainer: Element;

    constructor(@Inject(MAT_DIALOG_DATA) public data: Data | Games, private dialog: MatDialog, public translate: TranslateService) {}

    ngOnInit() {
        this.favouriteGames = this.data.data as GameSaved[];
    }

    ngAfterViewInit() {
        this.scrollContainer = this.scrollFrame.nativeElement;
        this.itemElements.changes.subscribe(() => this.scrollToBottom());
    }

    closeDialog(): void {
        this.dialog.closeAll();
    }

    private scrollToBottom(): void {
        this.scrollContainer.scroll({
            top: this.scrollContainer.scrollHeight,
            left: 0,
            behavior: 'auto',
        });
    }
}
