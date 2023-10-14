import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GalleryComponent } from '@app/components/gallery/gallery.component';

@Component({
    selector: 'app-confirm-window',
    templateUrl: './confirm-window.component.html',
    styleUrls: ['./confirm-window.component.scss'],
})
export class ConfirmWindowComponent {
    @ViewChild(GalleryComponent) galleryComponent: GalleryComponent;

    name: string = 'default';

    constructor(private dialog: MatDialogRef<ConfirmWindowComponent>) {}

    async confirmBtn() {
        this.dialog.close(true);
    }

    closeDialog() {
        this.dialog.close(false);
    }
}
