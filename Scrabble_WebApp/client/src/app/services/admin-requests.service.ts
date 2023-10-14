import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DictJSON } from '@app/classes/dict-json';
import { MockDict } from '@app/classes/mock-dict';

@Injectable({
    providedIn: 'root',
})
export class AdminRequestService {
    serverUrl = 'http://localhost:3000/admin';
    constructor(private httpClient: HttpClient) {}

    validateDictionnary(dictionnary: DictJSON | MockDict): boolean {
        return this.validateTitle(dictionnary.title) && this.validateDescription(dictionnary.description);
    }

    async uploadFile(formData: FormData) {
        return this.httpClient
            .post<DictJSON>(this.serverUrl, formData.get('dictionnary'), {
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
        const magicNumber32 = 32;

        for (let i = 0; i < text.length; i++) {
            const caracter = text.charCodeAt(i);
            if (caracter !== magicNumber32 && !this.isMajOrMinLetter(caracter)) {
                return false;
            }
        }
        return true;
    }
    private isMajOrMinLetter(charCode: number): boolean {
        const magicNumber65 = 65;
        const magicNumber90 = 90;
        const magicNumber97 = 97;
        const magicNumber122 = 122;
        const magicNumber130 = 231;
        const magicNumber140 = 234;

        return (
            (charCode >= magicNumber65 && charCode <= magicNumber90) ||
            (charCode >= magicNumber97 && charCode <= magicNumber122) ||
            (charCode >= magicNumber130 && charCode <= magicNumber140)
        );
    }
}
