import { Service } from 'typedi';
import * as fs from 'fs';

@Service()
export class TranslateService {
    userNameToLang: Map<string, string>;
    en: JSON;
    fr: JSON;

    constructor() {
        this.userNameToLang = new Map();
        this.en = JSON.parse(fs.readFileSync('assets/language/en.json', 'utf-8'));
        this.fr = JSON.parse(fs.readFileSync('assets/language/fr.json', 'utf-8'));
    }

    addUser(name: string, language: string) {
        this.userNameToLang.set(name, language);
    }

    deleteUser(name: string) {
        this.userNameToLang.delete(name);
    }

    translateMessage(name: string, key: string) {
        if (this.fr[key] !== undefined) {
            if (this.userNameToLang.get(name) === 'fr') {
                return this.fr[key];
            } else {
                return this.en[key];
            }
        } else return '';
    }

    translateCommand(name: string, message: string) {
        if (this.userNameToLang.get(name) === 'en') {
            message = message.replace('!placer', '!place');
            message = message.replace('!échanger', '!exchange');
            message = message.replace('!passer', '!pass');
            message = message.replace('!aide', '!help');
        }
        return message;
    }

    translateCommandFromPlayer(name: string, message: string) {
        if (this.userNameToLang.get(name) === 'en') {
            message = message.replace('!place ', '!placer ');
            message = message.replace('!exchange ', '!échanger ');
            message = message.replace('!pass ', '!passer ');
            message = message.replace('!help ', '!aide ');
        }
        return message;
    }
}
