/* eslint-disable deprecation/deprecation */
/* eslint-disable no-console */
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DictJSON } from '@app/classes/dict-json';
import { FileObject } from '@app/classes/file-object';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { ModalComponent } from '@app/pages/modal/modal.component';
import { AdminRequestService } from '@app/services/admin-requests.service';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;
    dictionarySelected: MockDict;
    dictionaryRead: DictJSON;
    fileName: string = '';

    constructor(
        public socketService: SocketService,
        public httpClient: HttpClient,
        public infoClientService: InfoClientService,
        public adminRequestService: AdminRequestService,
        public modal: MatDialog,
    ) {}

    ngOnInit(): void {
        this.dictionarySelected = { title: 'Dictionaire français par défaut', description: 'Description de base' };
    }

    openModalVP() {
        this.infoClientService.nameVP1dictionary0 = 1;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalVPContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.addNameBeginner(result.data.lastName, result.data.firstName);
        });
    }

    openModalVPExpert() {
        this.infoClientService.nameVP1dictionary0 = 1;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalVPContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.addNameExpert(result.data.lastName, result.data.firstName);
        });
    }

    editModalVP(formerVPName: NameVP) {
        this.infoClientService.nameVP1dictionary0 = 1;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalVPContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.editNameVP(result.data.lastName, result.data.firstName, formerVPName);
        });
    }

    editModalVPExpert(formerVPName: NameVP) {
        this.infoClientService.nameVP1dictionary0 = 1;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalVPContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.editNameVPExpert(result.data.lastName, result.data.firstName, formerVPName);
        });
    }

    openModalDict(formerDictTitle: string) {
        this.infoClientService.nameVP1dictionary0 = 0;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalDictionaryContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.editDictionary(result.data.title, result.data.description, formerDictTitle);
        });
    }

    onClick() {
        const fileUpload = this.fileUpload.nativeElement;
        if (fileUpload !== null) {
            fileUpload.onchange = () => {
                const file = fileUpload.files[0] as File;
                this.sendFile({ data: file, inProgress: false, progress: 0 });
            };
            fileUpload.click();
        }
    }

    async sendFile(file: FileObject) {
        this.fileName = file.data.name;
        const formData = new FormData();
        formData.append('dictionary', file.data, file.data.name);
        file.inProgress = true;
        await this.adminRequestService.uploadFile(formData);
        this.socketService.socket.emit('DictionaryUploaded');
    }

    getFile(title: string) {
        this.adminRequestService.downloadFile(title).subscribe((data) => saveAs(data, title + '.json'));
    }

    deleteVPName(vpName: NameVP) {
        this.socketService.socket.emit('DeleteVPName', vpName);
    }

    deleteVPNameExpert(vpName: NameVP) {
        this.socketService.socket.emit('DeleteExpertVPName', vpName);
    }

    refreshBestScoreDbs() {
        this.socketService.socket.emit('RefreshBothDbs');
    }

    isDefaultDict(dict: MockDict): boolean {
        return 'Dictionnaire français par défaut' === dict.title;
    }

    deleteDictionary(dict: MockDict): void {
        this.socketService.socket.emit('deleteSelectedDictionary', dict);
    }

    private addNameBeginner(nomVP: string, firstNameVP: string) {
        const newVPName: NameVP = { lastName: nomVP, firstName: firstNameVP, protected: false };
        this.socketService.socket.emit('AddBeginnerNameVP', newVPName);
    }

    private addNameExpert(nomVP: string, firstNameVP: string) {
        const newVPName: NameVP = { lastName: nomVP, firstName: firstNameVP, protected: false };
        this.socketService.socket.emit('AddExpertNameVP', newVPName);
    }

    private editDictionary(name: string, descrip: string, formerDictTitle: string): void {
        const dict = { title: name, description: descrip } as MockDict;
        if (this.adminRequestService.validateDictionary(dict)) {
            this.socketService.socket.emit('EditDictionary', dict, formerDictTitle);
            return;
        }
        alert('Le nouveau nom et/ou la nouvelle description du dictionaire ' + formerDictTitle + '  ne sont pas valides.');
    }

    private editNameVP(newNom: string, newFirstName: string, nameVP: NameVP) {
        const newName: NameVP = { lastName: newNom, firstName: newFirstName, protected: false };
        this.socketService.socket.emit('EditBeginnerNameVP', newName, nameVP);
    }

    private editNameVPExpert(newNom: string, newFirstName: string, nameVP: NameVP) {
        const newName: NameVP = { lastName: newNom, firstName: newFirstName, protected: false };
        this.socketService.socket.emit('EditExpertNameVP', newName, nameVP);
    }
}
