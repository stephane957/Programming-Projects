/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { SocketService } from '@app/services/socket.service';
import { io } from 'socket.io-client';
import { AdminPageComponent } from './admin-page.component';


describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;
    const urlString = `http://${window.location.hostname}:3000`;

    beforeEach(async () => {
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);

        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            providers: [
                { provide: Router, useValue: routerSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
            ],
            imports: [
                MatDialogModule,
                HttpClientModule,
                BrowserAnimationsModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        socketServiceSpyObj.socket = io(urlString);
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("openModalVP() should call modal.open", () => {
        const modalOpenSpy = spyOn(component['modal'], 'open').and.callThrough();

        component.openModalVP();
        expect(modalOpenSpy).toHaveBeenCalled();
    });

    // it("", () => {

    // });

    // it("", () => {

    // });

    // it("", () => {

    // });

    // it("", () => {

    // });

    it("deleteVPName() should call emit", () => {
        const nameVp: NameVP = { lastName: "yo", firstName: "test", protected: false };
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component.deleteVPName(nameVp);
        expect(emitSpy).toHaveBeenCalled();
    });

    it("deleteVPNameExpert() should call emit", () => {
        const nameVp: NameVP = { lastName: "yo", firstName: "test", protected: false };
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component.deleteVPNameExpert(nameVp);
        expect(emitSpy).toHaveBeenCalled();
    });

    it("refreshBestScoreDbs() should call emit", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component.refreshBestScoreDbs();
        expect(emitSpy).toHaveBeenCalled();
    });

    it("isDefaultDict() should return false if title is different than componentTitle", () => {
        let dictTest: MockDict = { title: "test", description: "test" }

        const returnValue = component.isDefaultDict(dictTest);
        expect(returnValue).toEqual(false);
    });

    it("deleteDictionnary() should call emit", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
        let dictTest: MockDict = { title: "test", description: "test" }

        component.deleteDictionnary(dictTest);
        expect(emitSpy).toHaveBeenCalled();
    });

    it("addNameBeginner() should call emit", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component['addNameBeginner']("John", "Regards");
        expect(emitSpy).toHaveBeenCalled();
    });

    it("addNameExpert() should call emit", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component['addNameExpert']("John", "Regards");
        expect(emitSpy).toHaveBeenCalled();
    });

    // it("editDictionnary() should call emit if the dictionnary has been validated", () => {
    //     const alertSpy = spyOn(window, 'alert');
    //     spyOn<any>(component, 'validateDictionnary').and.returnValue(false);

    //     component['editDictionnary']("John", "Regards", 'formerTitle');
    //     expect(alertSpy).toHaveBeenCalled();
    // });

    it("editDictionnary() should call emit if the dictionnary has been validated", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component['editDictionnary']("John", "Regards", 'formerTitle');
        expect(emitSpy).toHaveBeenCalled();
    });

    it("editNameVP() should call emit", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component['editNameVP']("John", "Regards", { lastName: "yo", firstName: "test", protected: false });
        expect(emitSpy).toHaveBeenCalled();
    });

    it("editNameVPExpert() should call emit", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');

        component['editNameVPExpert']("John", "Regards", { lastName: "yo", firstName: "test", protected: false });
        expect(emitSpy).toHaveBeenCalled();
    });

    // it("validateDictionnary() should return true if description and title are validated", () => {
    //     let dictTest: MockDict = { title: "test", description: "test" }

    //     const returnValue = component['validateDictionnary'](dictTest);
    //     expect(returnValue).toEqual(true);
    // });

    // it("validateTitle() should return true if title.size < 25 and there is no special characters", () => {
    //     const returnValue = component['validateTitle']('A');
    //     expect(returnValue).toEqual(true);
    // });

    // it("validateDescription() should return true if the size of the splitted word is less than 20", () => {
    //     const returnValue = component['validateDescription']('A');
    //     expect(returnValue).toEqual(true);
    // });

    // it("verifySpecialCaracters() should return true if number is space or letter ", () => {
    //     const returnValue = component['verifySpecialCaracters']('A');
    //     expect(returnValue).toEqual(true);
    // });

    // it("verifySpecialCaracters() should return false if number is not space or letter ", () => {
    //     const returnValue = component['verifySpecialCaracters']('1');
    //     expect(returnValue).toEqual(false);
    // });

    // it("isMajOrMinLetter() should return true if letter is an uppercase", () => {
    //     const returnValue = component['isMajOrMinLetter'](66);
    //     expect(returnValue).toEqual(true);
    // });

    // it("isMajOrMinLetter() should return true if letter is an lowercase", () => {
    //     const returnValue = component['isMajOrMinLetter'](98);
    //     expect(returnValue).toEqual(true);
    // });

    // it("isMajOrMinLetter() should return true if letter is a letter with accen", () => {
    //     const returnValue = component['isMajOrMinLetter'](131);
    //     expect(returnValue).toEqual(true);
    // });
});
