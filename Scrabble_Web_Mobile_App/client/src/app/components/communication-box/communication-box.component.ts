import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
})
export class CommunicationBoxComponent implements AfterViewInit {
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    @ViewChildren('commands') itemElements: QueryList<Element>;

    inputInComBox: string = '';
    private scrollContainer: Element;

    constructor(private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService, public infoClientService: InfoClientService) {}

    ngAfterViewInit() {
        this.scrollContainer = this.scrollFrame.nativeElement;
        // we weren't able to find an equivalent without using using subscribe
        // nothing was working for this specific case
        // eslint-disable-next-line deprecation/deprecation
        this.itemElements.changes.subscribe(() => this.scrollToBottom());
    }

    onLeftClickComBox(): void {
        this.mouseKeyboardEventHandler.onCommunicationBoxLeftClick();
    }

    // function that shows the content of the input, the place in the message array
    // and delete the input field
    onEnterComBox(input: string): void {
        if (!this.mouseKeyboardEventHandler.isCommunicationBoxFocus) {
            return;
        }
        (document.getElementById('inputCommBox') as HTMLInputElement).value = '';
        this.mouseKeyboardEventHandler.onCommunicationBoxEnter(input);
    }

    private scrollToBottom(): void {
        this.scrollContainer.scroll({
            top: this.scrollContainer.scrollHeight,
            left: 0,
            behavior: 'auto',
        });
    }
}
