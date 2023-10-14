import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-profile-read-only-page',
    templateUrl: './profile-read-only-page.component.html',
    styleUrls: ['./profile-read-only-page.component.scss'],
})
export class ProfileReadOnlyPageComponent {
    // eslint-disable-next-line no-invalid-this, @typescript-eslint/no-explicit-any
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private matDialogRefProfile: MatDialogRef<ProfileReadOnlyPageComponent>) {}

    millisToMinutesAndSeconds() {
        const date = new Date(this.data.userInfo.averageTimePerGame as number);
        const m = date.getMinutes();
        const s = date.getSeconds();
        return `${m}m:${s}s.`;
    }

    closeDialog() {
        this.matDialogRefProfile.close();
    }
}
