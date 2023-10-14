/* eslint-disable*/
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockDict } from '@app/classes/mock-dict';
import { AdminRequestService } from './admin-requests.service';


describe('AdminRequestService', () => {
    let service: AdminRequestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        service = TestBed.inject(AdminRequestService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it("validateDictionary() should return true if description and title are validated", () => {
        let dictTest: MockDict = { title: "test", description: "test" }

        const returnValue = service['validateDictionary'](dictTest);
        expect(returnValue).toEqual(true);
    });

    it("validateTitle() should return true if title.size < 25 and there is no special characters", () => {
        const returnValue = service['validateTitle']('A');
        expect(returnValue).toEqual(true);
    });

    it("validateDescription() should return true if the size of the splitted word is less than 20", () => {
        const returnValue = service['validateDescription']('A');
        expect(returnValue).toEqual(true);
    });

    it("verifySpecialCaracters() should return true if number is space or letter ", () => {
        const returnValue = service['verifySpecialCaracters']('A');
        expect(returnValue).toEqual(true);
    });

    it("verifySpecialCaracters() should return false if number is not space or letter ", () => {
        const returnValue = service['verifySpecialCaracters']('1');
        expect(returnValue).toEqual(false);
    });

    it("isMajOrMinLetter() should return true if letter is an uppercase", () => {
        const returnValue = service['isMajOrMinLetter'](66);
        expect(returnValue).toEqual(true);
    });

    it("isMajOrMinLetter() should return true if letter is an lowercase", () => {
        const returnValue = service['isMajOrMinLetter'](98);
        expect(returnValue).toEqual(true);
    });

    it("isMajOrMinLetter() should return true if letter is a letter with accent", () => {
        const returnValue = service['isMajOrMinLetter'](131);
        expect(returnValue).toEqual(true);
    });
});
