/* eslint-disable deprecation/deprecation */
/* eslint-disable no-console */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DictJSON } from '@app/classes/dict-json';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { ModalComponent } from '@app/pages/modal/modal.component';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { AdminRequestService } from '@app/services/admin-requests.service';
import { FileObject } from '@app/classes/file-object';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;
    dictionnarySelected: MockDict;
    dictionnaryRead: DictJSON;
    fileName: string = '';
    files: FileObject[];

    constructor(
        public socketService: SocketService,
        public httpClient: HttpClient,
        public infoClientService: InfoClientService,
        public adminRequestService: AdminRequestService,
        private modal: MatDialog,
    ) {}

    ngOnInit(): void {
        this.dictionnarySelected = { title: 'Dictionnaire français par défaut', description: 'Description de base' };
        this.files = [];
    }

    openModalVP() {
        this.infoClientService.nameVP1dictionnary0 = 1;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalVPContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.addNameBeginner(result.data.lastName, result.data.firstName);
        });
    }

    openModalVPExpert() {
        this.infoClientService.nameVP1dictionnary0 = 1;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalVPContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.addNameExpert(result.data.lastName, result.data.firstName);
        });
    }

    editModalVP(formerVPName: NameVP) {
        this.infoClientService.nameVP1dictionnary0 = 1;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalVPContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.editNameVP(result.data.lastName, result.data.firstName, formerVPName);
        });
    }

    editModalVPExpert(formerVPName: NameVP) {
        this.infoClientService.nameVP1dictionnary0 = 1;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalVPContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.editNameVPExpert(result.data.lastName, result.data.firstName, formerVPName);
        });
    }

    openModalDict(formerDictTitle: string) {
        this.infoClientService.nameVP1dictionnary0 = 0;
        const modalRef = this.modal.open(ModalComponent, {
            panelClass: 'modalDictionnaryContainer',
        });

        modalRef.afterClosed().subscribe((result) => {
            this.editDictionnary(result.data.title, result.data.description, formerDictTitle);
        });
    }

    onClick() {
        const fileUpload = this.fileUpload.nativeElement;
        if (fileUpload !== null) {
            fileUpload.onchange = () => {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let index = 0; index < fileUpload.files.length; index++) {
                    const file = fileUpload.files[index] as File;
                    this.files.push({ data: file, inProgress: false, progress: 0 });
                }
                this.sendFiles();
            };
            fileUpload.click();
        }
    }

    async sendFile(file: FileObject) {
        this.fileName = file.data.name + ' téléversé!';
        const formData = new FormData();
        formData.append('dictionnary', file.data, file.data.name);
        file.inProgress = true;
        this.files = [];
        await this.adminRequestService.uploadFile(formData);
        this.socketService.socket.emit('DictionnaryUploaded');
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
        return this.dictionnarySelected.title === dict.title;
    }

    deleteDictionnary(dict: MockDict): void {
        this.socketService.socket.emit('deleteSelectedDictionnary', dict);
    }

    private addNameBeginner(nomVP: string, prenomVP: string) {
        const newVPName: NameVP = { lastName: nomVP, firstName: prenomVP, protected: false };
        this.socketService.socket.emit('AddBeginnerNameVP', newVPName);
    }

    private addNameExpert(nomVP: string, prenomVP: string) {
        const newVPName: NameVP = { lastName: nomVP, firstName: prenomVP, protected: false };
        this.socketService.socket.emit('AddExpertNameVP', newVPName);
    }

    private editDictionnary(name: string, descrip: string, formerDictTitle: string): void {
        const dict = { title: name, description: descrip } as MockDict;
        if (this.adminRequestService.validateDictionnary(dict)) {
            this.socketService.socket.emit('EditDictionnary', dict, formerDictTitle);
            return;
        }
        alert('Le nouveau nom et/ou la nouvelle description du dictionnaire ' + formerDictTitle + '  ne sont pas valides.');
    }

    private editNameVP(newNom: string, newPrenom: string, nameVP: NameVP) {
        const newName: NameVP = { lastName: newNom, firstName: newPrenom, protected: false };
        this.socketService.socket.emit('EditBeginnerNameVP', newName, nameVP);
    }

    private editNameVPExpert(newNom: string, newPrenom: string, nameVP: NameVP) {
        const newName: NameVP = { lastName: newNom, firstName: newPrenom, protected: false };
        this.socketService.socket.emit('EditExpertNameVP', newName, nameVP);
    }

    private sendFiles() {
        this.fileUpload.nativeElement.value = '';
        this.files.forEach((file) => {
            this.sendFile(file);
        });
    }
}
