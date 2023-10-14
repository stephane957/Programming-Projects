/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { FileObject } from '@app/classes/file-object';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { AdminRequestService } from '@app/services/admin-requests.service';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { io } from 'socket.io-client';
import { AdminPageComponent } from './admin-page.component';


export class MockElementRef extends ElementRef {
    constructor() { super(null); }
}

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let routerSpyObj: jasmine.SpyObj<Router>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketService>;
    let adminRequestServiceSpyObj: jasmine.SpyObj<AdminRequestService>;
    class MockElementRef implements ElementRef {
        nativeElement = {
            click() {
                return;
            }
        };
        onchange = () => {
            return;
        }
    }

    const urlString = `http://${window.location.hostname}:3000`;


    beforeEach(async () => {
        routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['']);
        adminRequestServiceSpyObj = jasmine.createSpyObj('AdminRequestService', ['validateDictionary', 'uploadFile', 'downloadFile']);

        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            providers: [
                { provide: Router, useValue: routerSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: AdminRequestService, useValue: adminRequestServiceSpyObj },
                { provide: ElementRef, useValue: new MockElementRef() }
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
        const spyOpen = spyOn(component['modal'], 'open')
            .and
            .returnValue({
                afterClosed: () => of({ data: { lastName: 'test', firstName: 'test' } })
            } as MatDialogRef<typeof component>);

        component.openModalVP();
        expect(spyOpen).toHaveBeenCalled();
    });

    it("openModalVPExpert() should call modal.open", () => {
        const spyOpen = spyOn(component['modal'], 'open')
            .and
            .returnValue({
                afterClosed: () => of({ data: { lastName: 'test', firstName: 'test' } })
            } as MatDialogRef<typeof component>);

        component.openModalVPExpert();
        expect(spyOpen).toHaveBeenCalled();
    });

    it("editModalVP() should call modal.open", () => {
        const spyOpen = spyOn(component['modal'], 'open')
            .and
            .returnValue({
                afterClosed: () => of({ data: { lastName: 'test', firstName: 'test' } })
            } as MatDialogRef<typeof component>);

        const nameVp: NameVP = { lastName: "yo", firstName: "test", protected: false };

        component.editModalVP(nameVp);
        expect(spyOpen).toHaveBeenCalled();
    });

    it("editModalVPExpert() should call modal.open", () => {
        const spyOpen = spyOn(component['modal'], 'open')
            .and
            .returnValue({
                afterClosed: () => of({ data: { lastName: 'test', firstName: 'test' } })
            } as MatDialogRef<typeof component>);

        const nameVp: NameVP = { lastName: "yo", firstName: "test", protected: false };

        component.editModalVPExpert(nameVp);
        expect(spyOpen).toHaveBeenCalled();
    });

    it("openModalDict() should call modal.open", () => {
        const spyOpen = spyOn(component['modal'], 'open')
            .and
            .returnValue({
                afterClosed: () => of({ data: { lastName: 'test', firstName: 'test' } })
            } as MatDialogRef<typeof component>);

        component.openModalDict('formerTitle');
        expect(spyOpen).toHaveBeenCalled();
    });

    it("onClick() should call fileUpload.click()", () => {
        component.fileUpload = new MockElementRef();
        const clickSpy = spyOn(component.fileUpload.nativeElement, 'click');
        component.fileUpload

        component.onClick();
        expect(clickSpy).toHaveBeenCalled();
    });

    it("sendFile() should call emit", () => {
        const file = new File([""], "filename");
        const fileTest: FileObject = { data: file, inProgress: true, progress: 3 };

        component.sendFile(fileTest);
        expect(adminRequestServiceSpyObj.uploadFile).toHaveBeenCalled();
    });

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

    it("deleteary() should call emit", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
        let dictTest: MockDict = { title: "test", description: "test" }

        component.deleteDictionary(dictTest);
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

    it("editDictionary() should call emit if the dictionary has been validated", () => {
        const alertSpy = spyOn(window, 'alert');
        adminRequestServiceSpyObj.validateDictionary.and.returnValue(false);

        component['editDictionary']("John", "Regards", 'formerTitle');
        expect(alertSpy).toHaveBeenCalled();
    });

    it("editDictionary() should call emit if the dictionary has been validated", () => {
        const emitSpy = spyOn(socketServiceSpyObj.socket, 'emit');
        adminRequestServiceSpyObj.validateDictionary.and.returnValue(true);

        component['editDictionary']("John", "Regards", 'formerTitle');
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

    it("sendFile() should call sendFile once", () => {
        component.fileUpload = new MockElementRef();
        const sendFileSpy = spyOn(component, 'sendFile');
        const file = new File([""], "filename");
        const fileTest: FileObject = { data: file, inProgress: true, progress: 3 };

        component['sendFile'](fileTest);
        expect(sendFileSpy).toHaveBeenCalled();
    });

    it("getFile() should call downloadFile", () => {
        adminRequestServiceSpyObj.downloadFile.and.returnValue(of<Blob>());

        component.getFile('title');
        expect(adminRequestServiceSpyObj.downloadFile).toHaveBeenCalled();
    });
});
