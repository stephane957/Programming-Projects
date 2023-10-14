import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import * as GlobalConstants from '@app/classes/global-constants';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';

@Component({
    selector: 'app-stand-rp',
    templateUrl: './stand-rp.component.html',
    styleUrls: ['./stand-rp.component.scss'],
})
export class StandRPComponent implements AfterViewInit {
    @ViewChild('gridStandRP ', { static: false }) private gridStandRP!: ElementRef<HTMLCanvasElement>;
    canvasStandSize: Vec2 = { x: GlobalConstants.DEFAULT_WIDTH_STAND, y: GlobalConstants.DEFAULT_HEIGHT_STAND };

    constructor(private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService, private drawingService: DrawingService) {}

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

    ngAfterViewInit(): void {
        this.drawingService.initStandCanvas(this.gridStandRP.nativeElement.getContext('2d') as CanvasRenderingContext2D);
    }

    onLeftClickStand(event: MouseEvent) {
        this.mouseKeyboardEventHandler.onLeftClickStand(event);
    }

    onRightClickStand(event: MouseEvent) {
        this.mouseKeyboardEventHandler.onRightClickStand(event);
    }
}
