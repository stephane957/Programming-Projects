import { Component, Injectable, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { InfoClientService } from '@app/services/info-client.service';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
})
@Injectable()
export class ModalComponent {
    @ViewChild('first') first: NgModel;
    @ViewChild('second') second: NgModel;
    @ViewChild('form') form: NgForm;

    constructor(private dialogRef: MatDialogRef<ModalComponent>, public infoClientService: InfoClientService) {}

    closeModalVP() {
        const firstNameInput = document.getElementById('firstInput') as HTMLInputElement;
        const lastNameInput = document.getElementById('secondInput') as HTMLInputElement;

        this.dialogRef.close({ data: { firstName: firstNameInput.value, lastName: lastNameInput.value } });
    }

    closeModalDict() {
        const titleInput = document.getElementById('firstInput') as HTMLInputElement;
        const descriptionInput = document.getElementById('secondInput') as HTMLInputElement;

        this.dialogRef.close({ data: { title: titleInput.value, description: descriptionInput.value } });
    }
}
