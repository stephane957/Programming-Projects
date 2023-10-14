import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as GlobalConstants from '@app/classes/global-constants';
import { Vec2 } from '@app/classes/vec2';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements AfterViewInit {
    @ViewChild('gridBoard', { static: false }) gridBoard!: ElementRef<HTMLCanvasElement>;
    boardCanvasSize: Vec2 = { x: GlobalConstants.DEFAULT_WIDTH_BOARD, y: GlobalConstants.DEFAULT_HEIGHT_BOARD };

    constructor(private drawingBoardService: DrawingBoardService, private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService) {}

    ngAfterViewInit(): void {
        this.drawingBoardService.canvasInit(this.gridBoard.nativeElement.getContext('2d') as CanvasRenderingContext2D);
    }

    onComponentBoardClick(event: MouseEvent) {
        this.mouseKeyboardEventHandler.onBoardClick(event);
    }
}
