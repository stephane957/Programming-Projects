/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ModalVpLevelsComponent } from './modal-vp-levels.component';

export class MatDialogRefMock {
    close(value = '') {}
}
describe('ModalVpLevelsComponent', () => {
    let component: ModalVpLevelsComponent;
    let fixture: ComponentFixture<ModalVpLevelsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, FormsModule],
            declarations: [ModalVpLevelsComponent],
            providers: [{ provide: MatDialogRef, useClass: MatDialogRefMock }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalVpLevelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('vpLevelSelection() should set infoClientService.vpLevel with parameter', () => {
        component.vpLevelSelection('test');
        expect(component.infoClientService.vpLevel).toEqual('test');
    });

    it('closeModal() should call dialogRef.close', () => {
        const modalCloseSpy = spyOn(component['dialogRef'], 'close').and.callThrough();
        component.closeModal();
        expect(modalCloseSpy).toHaveBeenCalled();
    });
});
