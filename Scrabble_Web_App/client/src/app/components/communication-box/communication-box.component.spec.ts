/*eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { CommunicationBoxComponent } from './communication-box.component';

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let placeGraphicServiceSpyObj: jasmine.SpyObj<PlaceGraphicService>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;
    let mouseKeyboardEventHandlerServiceSpyObj: jasmine.SpyObj<MouseKeyboardEventHandlerService>;

    beforeEach(() => {
        mouseKeyboardEventHandlerServiceSpyObj = jasmine.createSpyObj('MouseKeyboardEventHandlerService', [
            'onCommunicationBoxLeftClick',
            'onCommunicationBoxEnter',
        ]);
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        placeGraphicServiceSpyObj = jasmine.createSpyObj('PlaceGraphicService', ['deleteEveryLetterPlacedOnBoard']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['']);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [CommunicationBoxComponent],
            providers: [
                { provide: MouseKeyboardEventHandlerService, useValue: mouseKeyboardEventHandlerServiceSpyObj },
                { provide: Router, useValue: routerSpyObj },
                { provide: PlaceGraphicService, useValue: placeGraphicServiceSpyObj },
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        infoClientServiceSpyObj.game = new GameServer(1, false, 'Multi', false);
        infoClientServiceSpyObj.player = new Player('Multi');
        fixture = TestBed.createComponent(CommunicationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call sendMessage if its a simple message', () => {
        mouseKeyboardEventHandlerServiceSpyObj.isCommunicationBoxFocus = true;
        component.onEnterComBox('asd');
        expect((document.getElementById('inputCommBox') as HTMLInputElement).value).toEqual('');
    });
    it('should call sendMessage if its a simple message', () => {
        mouseKeyboardEventHandlerServiceSpyObj.isCommunicationBoxFocus = false;
        component.onEnterComBox('asd');
        expect((document.getElementById('inputCommBox') as HTMLInputElement).value).toEqual('');
    });

    it('should call onCommunicationBoxLeftClick when onClick is called', () => {
        // const onCommunicationBoxLeftClick = spyOn(mouseKeyboardEventHandlerServiceSpyObj, 'onCommunicationBoxLeftClick');
        component.onLeftClickComBox();
        expect(mouseKeyboardEventHandlerServiceSpyObj.onCommunicationBoxLeftClick).toHaveBeenCalled();
    });
    it('should call clearHistory when onClick is called', () => {
        const componentSpy = spyOn<any>(component, 'scrollToBottom');
        component['scrollToBottom']();
        expect(componentSpy).toHaveBeenCalled();
    });
    it('should call clearHistory when onClick is called', () => {
        const scrollSpy = spyOn(component['scrollContainer'], 'scroll').and.returnValue();
        component['scrollToBottom']();
        expect(scrollSpy).toHaveBeenCalled();
    });
    it('should call scrollToBottom when itemElements is modified', () => {
        const scrollSpy = spyOn(component['scrollContainer'], 'scroll').and.returnValue();
        component['scrollToBottom']();
        expect(scrollSpy).toHaveBeenCalled();
    });
});
