import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DictJSON } from '@app/classes/dict-json';
import { MockDict } from '@app/classes/mock-dict';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdminRequestService {
    // serverUrl = 'http://localhost:3000/admin';
    serverUrl = environment.serverUrl + 'admin';

    constructor(private httpClient: HttpClient) {}

    validateDictionary(dictionary: DictJSON | MockDict): boolean {
        return this.validateTitle(dictionary.title) && this.validateDescription(dictionary.description);
    }

    async uploadFile(formData: FormData) {
        return this.httpClient
            .post<DictJSON>(this.serverUrl, formData.get('dictionary'), {
                reportProgress: true,
                observe: 'events',
                responseType: 'json',
            })
            .toPromise()
            .catch((error: HttpErrorResponse) => {
                this.handleErrorPOST(error);
            });
    }

    downloadFile(nameDict: string) {
        return this.httpClient.get(this.serverUrl, { params: { title: nameDict }, reportProgress: true, responseType: 'blob' });
    }

    private handleErrorPOST(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            alert('Erreur: ' + error.status + error.error.message);
        } else {
            alert(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.error}`);
        }
    }

    private validateTitle(title: string): boolean {
        const maxCaracters = 25;
        return title.length <= maxCaracters && this.verifySpecialCaracters(title);
    }

    private validateDescription(descript: string): boolean {
        const maxWords = 20;
        const splitted: string[] = descript.split('', maxWords);
        return splitted.length <= maxWords && this.verifySpecialCaracters(descript);
    }

    private verifySpecialCaracters(text: string): boolean {
        const asciiShiftWhiteSpace = 32;

        for (let i = 0; i < text.length; i++) {
            const caracter = text.charCodeAt(i);
            if (caracter !== asciiShiftWhiteSpace && !this.isMajOrMinLetter(caracter)) {
                return false;
            }
        }
        return true;
    }
    private isMajOrMinLetter(charCode: number): boolean {
        const upperCaseLettersAsciiShift = 65;
        const endOfUpperCaseLettersAsciiShift = 90;
        const lowerCaseLettersAsciiShift = 97;
        const endOfLowerCaseLettersAsciiShift = 122;
        const asciiShiftForFirstLettersWithAccent = 130;
        const asciiShiftForLastLettersWithAccent = 140;

        return (
            (charCode >= upperCaseLettersAsciiShift && charCode <= endOfUpperCaseLettersAsciiShift) ||
            (charCode >= lowerCaseLettersAsciiShift && charCode <= endOfLowerCaseLettersAsciiShift) ||
            (charCode >= asciiShiftForFirstLettersWithAccent && charCode <= asciiShiftForLastLettersWithAccent)
        );
    }
}
