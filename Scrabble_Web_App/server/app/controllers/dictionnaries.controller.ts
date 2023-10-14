/* eslint-disable @typescript-eslint/no-empty-function */
import { Collections } from '@app/classes/collections';
import { DictJSON } from '@app/classes/dict-json';
import * as GlobalConstants from '@app/classes/global-constants';
import { DatabaseService } from '@app/services/database.service';
import { Request, Response, Router } from 'express';
import * as fs from 'fs';
import * as Httpstatus from 'http-status-codes';
import * as path from 'path';
import { Service } from 'typedi';

@Service()
export class DictionariesController {
    router: Router;
    collection: Collections;
    constructor(private databaseService: DatabaseService) {
        this.configureRouter();
    }

    private async checkDirectory() {
        try {
            fs.access('./dictionaries', () => {});
        } catch {
            fs.mkdir('./dictionaries', () => {});
        }
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.post('/', async (req: Request, res: Response) => {
            await this.checkDirectory();
            this.collection = new Collections(this.databaseService.database, GlobalConstants.DATABASE_COLLECTION_DICTIONARIES);
            await this.collection
                .addDictionary(req.body)
                .then(() => {
                    res.status(Httpstatus.StatusCodes.CREATED).send();
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
            try {
                const dictionary: DictJSON = req.body;
                fs.writeFile(path.join('./dictionaries/' + dictionary.title + '.json'), JSON.stringify(req.body), () => {});
            } catch (error) {
                res.send(error + '. La sauvegarde du dictionaire téléversé a échoué.');
            }
        });

        this.router.get('/', async (req: Request, res: Response) => {
            const title: string = req.query.title as string;
            this.collection = new Collections(this.databaseService.database, GlobalConstants.DATABASE_COLLECTION_DICTIONARIES);
            await this.collection
                .getDictionary(title)
                .then(async (dictionary: DictJSON) => {
                    res.send(JSON.stringify(dictionary));
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });
    }
}
