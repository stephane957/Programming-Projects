import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { InfoClientService } from '@app/services/info-client.service';

@Component({
    selector: 'app-modal-vp-levels',
    templateUrl: './modal-vp-levels.component.html',
    styleUrls: ['./modal-vp-levels.component.scss'],
})
export class ModalVpLevelsComponent implements OnInit {
    vpLevels: string[];
    level: string = 'beginner';

    constructor(private dialogRef: MatDialogRef<ModalVpLevelsComponent>, public infoClientService: InfoClientService) {}

    ngOnInit(): void {
        this.vpLevels = ['debutant', 'expert'];
    }

    vpLevelSelection(level: string) {
        this.infoClientService.vpLevel = level;
    }

    closeModal() {
        this.dialogRef.close(this.level);
    }
}
