/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { InfoClientService } from '@app/services/info-client.service';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let classicButtonSpyObj: jasmine.SpyObj<MatExpansionPanel>;
    let log2990ButtonSpyObj: jasmine.SpyObj<MatExpansionPanel>;
    let infoClientServiceSpyObj: jasmine.SpyObj<InfoClientService>;

    beforeEach(() => {
        classicButtonSpyObj = jasmine.createSpyObj('MatExpansionPanel', ['toggle']);
        log2990ButtonSpyObj = jasmine.createSpyObj('MatExpansionPanel', ['toggle']);
        infoClientServiceSpyObj = jasmine.createSpyObj('InfoClientService', ['generateNameOpponent']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule, FormsModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: InfoClientService, useValue: infoClientServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.classicButtons = classicButtonSpyObj;
        component.log2990Button = log2990ButtonSpyObj;
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onClickSolo should call generateNameOpponent', () => {
        component.onClickSolo('classic');
        expect(infoClientServiceSpyObj.isLog2990Enabled).toEqual(false);
    });

    it('onClickSolo should call generateNameOpponent', () => {
        component.onClickSolo('otherThanClassic');
        expect(infoClientServiceSpyObj.isLog2990Enabled).toEqual(true);
    });

    it('onClickMulti should change the gameMode', () => {
        infoClientServiceSpyObj.gameMode = '';
        component.onClickMulti('classic');
        expect(infoClientServiceSpyObj.isLog2990Enabled).toEqual(false);
    });

    it('onClickMulti should change the gameMode', () => {
        infoClientServiceSpyObj.gameMode = '';
        component.onClickMulti('otherThanClassic');
        expect(infoClientServiceSpyObj.isLog2990Enabled).toEqual(true);
    });

    it('noNameError should call generateNameOpponent', () => {
        const spyAlert = spyOn(window, 'alert').and.returnValue();
        component.noNameError();
        expect(spyAlert).toHaveBeenCalled();
    });

    it('should change ExpansionPanelHidden to ExpansionPanel', () => {
        component.expansionPanelStyleClassic = 'ExpansionPanelHidden';
        component.toggleClassic();
        expect(component.expansionPanelStyleClassic).toEqual('ExpansionPanel');
        expect(classicButtonSpyObj.toggle).toHaveBeenCalled();
    });

    it('should change ExpansionPanel to ExpansionPanelHidden', () => {
        component.expansionPanelStyleClassic = 'ExpansionPanel';
        component.toggleClassic();
        expect(component.expansionPanelStyleClassic).toEqual('ExpansionPanelHidden');
        expect(classicButtonSpyObj.toggle).toHaveBeenCalled();
    });

    it('should change ExpansionPanelHidden to ExpansionPanel', () => {
        component.expansionPanelStyleLOG2990 = 'ExpansionPanelHidden';
        component.toggleLOG2990();
        expect(component.expansionPanelStyleLOG2990).toEqual('ExpansionPanel');
        expect(log2990ButtonSpyObj.toggle).toHaveBeenCalled();
    });

    it('should change ExpansionPanel to ExpansionPanelHidden', () => {
        component.expansionPanelStyleLOG2990 = 'ExpansionPanel';
        component.toggleLOG2990();
        expect(component.expansionPanelStyleLOG2990).toEqual('ExpansionPanelHidden');
        expect(log2990ButtonSpyObj.toggle).toHaveBeenCalled();
    });

    it('onSubmit should call generateNameOpponent function', () => {
        const oldSubmit = component.submitted;
        component.onSubmit();
        expect(oldSubmit).toEqual(!component.submitted);
    });
});
