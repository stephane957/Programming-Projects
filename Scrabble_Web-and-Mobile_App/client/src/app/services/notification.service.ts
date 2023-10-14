import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(private snackBar: MatSnackBar) {}

    openSnackBar(message: string, isSuccess: boolean): void {
        this.snackBar.open(message, 'Fermer', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: isSuccess ? ['sucess-snackbar'] : ['error-snackbar'],
        });
    }
}
