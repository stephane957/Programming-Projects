/* eslint-disable @typescript-eslint/no-empty-function */
import { Request, Response, Router } from 'express';
import * as Httpstatus from 'http-status-codes';
import { Service } from 'typedi';
import { DatabaseService } from '@app/services/database.service';
import { Collections } from '@app/classes/collections';
import * as GlobalConstants from '@app/classes/global-constants';
import * as fs from 'fs';
import * as path from 'path';
import { DictJSON } from '@app/classes/dict-json';

@Service()
export class DictionnariesController {
    router: Router;
    collection: Collections;
    constructor(private databaseService: DatabaseService) {
        this.configureRouter();
    }

    private async checkDirectory() {
        try {
            fs.access('./Dictionnaries', () => {});
        } catch {
            fs.mkdir('./Dictionnaries', () => {});
        }
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.post('/', async (req: Request, res: Response) => {
            await this.checkDirectory();
            this.collection = new Collections(this.databaseService.database, GlobalConstants.DATABASE_COLLECTION_DICTIONNARIES);
            await this.collection
                .addDictionnary(req.body)
                .then(() => {
                    res.status(Httpstatus.StatusCodes.CREATED).send();
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
            try {
                const dictionnary: DictJSON = req.body;
                fs.writeFile(path.join('./Dictionnaries/' + dictionnary.title + '.json'), JSON.stringify(req.body), () => {});
            } catch (error) {
                res.send(error + '. La sauvegarde du dictionnaire téléversé a échoué.');
            }
        });

        this.router.get('/', async (req: Request, res: Response) => {
            const title: string = req.query.title as string;
            this.collection = new Collections(this.databaseService.database, GlobalConstants.DATABASE_COLLECTION_DICTIONNARIES);
            await this.collection
                .getDictionnary(title)
                .then(async (dictionnary: DictJSON) => {
                    // console.log(dictionnary);
                    res.send(JSON.stringify(dictionnary));
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });
    }
}
