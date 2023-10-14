/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ModalComponent } from './modal.component';

export class MatDialogRefMock {
    close(value = '') {

    }
}
describe('ModalVPComponent', () => {
    let component: ModalComponent;
    let fixture: ComponentFixture<ModalComponent>;


    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, FormsModule],
            declarations: [ModalComponent],
            providers: [
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("openModalVP() should call modal.close", () => {
        const modalCloseSpy = spyOn(component['dialogRef'], 'close').and.callThrough();

        component.closeModalVP();
        expect(modalCloseSpy).toHaveBeenCalled();
    });

    it("closeModalDict() should call modal.close", () => {
        const modalCloseSpy = spyOn(component['dialogRef'], 'close').and.callThrough();

        component.closeModalDict();
        expect(modalCloseSpy).toHaveBeenCalled();
    });
});
