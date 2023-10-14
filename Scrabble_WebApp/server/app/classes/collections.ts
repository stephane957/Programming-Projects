/* eslint-disable @typescript-eslint/no-magic-numbers */
import { MockDict } from '@app/classes/mock-dict';
import { Collection, Db, Filter, ModifyResult, UpdateFilter } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DictJSON } from './dict-json';
import { HttpException } from './http.exception';
import { NameVP } from './names-vp';
import { Score } from './score';

@Service()
export class Collections {
    dictionnarySelected: DictJSON;
    dictionnariesFromDatabase: MockDict[];
    scoreClassicFromDatabase: Score[];
    scoreLOG2990FromDatabase: Score[];
    namesVpFromDatabase: NameVP[];
    sameTitleFound: boolean;

    constructor(private database: Db, private collectionName: string) {
        this.dictionnarySelected = { title: '', description: '', words: [] };
        this.dictionnariesFromDatabase = [];
        this.scoreClassicFromDatabase = [];
        this.scoreLOG2990FromDatabase = [];
    }
    get collection(): Collection {
        return this.database.collection(this.collectionName);
    }

    async getScoreClassic(): Promise<Score[]> {
        this.scoreClassicFromDatabase = (await this.collection.find({}).toArray()) as unknown as Score[];

        this.scoreClassicFromDatabase.sort((a, b) => {
            return Number(b.score) - Number(a.score);
        });

        return this.scoreClassicFromDatabase;
    }

    async getScoreLOG2990(): Promise<Score[]> {
        this.scoreLOG2990FromDatabase = (await this.collection.find({}, {}).toArray()) as unknown as Score[];

        this.scoreLOG2990FromDatabase.sort((a, b) => {
            return Number(b.score) - Number(a.score);
        });
        return this.scoreLOG2990FromDatabase;
    }

    async getAllDictionnaries(): Promise<MockDict[]> {
        this.dictionnariesFromDatabase = (await this.collection
            .find({}, { projection: { title: 1, description: 1, _id: 0 } })
            .toArray()) as unknown as MockDict[];
        return this.dictionnariesFromDatabase;
    }

    async deleteAllDictionnaries(): Promise<void> {
        await this.collection.deleteMany({ title: { $nin: ['Dictionnaire français par défaut'] } });
    }

    async getAllVPNames(): Promise<NameVP[]> {
        this.namesVpFromDatabase = (await this.collection
            .find({}, { projection: { lastName: 1, firstName: 1, protected: 1, _id: 0 } })
            .toArray()) as unknown as NameVP[];
        return this.namesVpFromDatabase;
    }

    async getDictionnary(name: string): Promise<DictJSON> {
        this.dictionnarySelected = (await this.collection.findOne({ title: name }, { projection: { _id: 0 } })) as unknown as DictJSON;
        return this.dictionnarySelected;
    }

    async addDictionnary(dictionnary: DictJSON): Promise<void> {
        await this.checkNotSameTitles(dictionnary.title);
        if (!this.sameTitleFound) {
            await this.collection.insertOne(dictionnary).catch((error: Error) => {
                throw new HttpException('500: Failed to insert dictionnary ' + error.message);
            });
        } else {
            throw new Error('Un dictionnaire au titre identique à celui que vous avez tenté de téléverser existe déjà.\n Saisissez un autre titre.');
        }
    }

    async addNameVP(nameVP: NameVP): Promise<void> {
        await this.collection.insertOne(nameVP).catch((error: Error) => {
            throw new HttpException('500: Failed to insert name ' + error);
        });
    }

    async deleteDictionnary(name: string): Promise<void> {
        return this.collection
            .findOneAndDelete({ title: name })
            .then((resolve: ModifyResult<DictJSON>) => {
                if (!resolve.value) {
                    throw new Error('Dictionnaire introuvable');
                }
            })
            .catch(() => {
                throw new Error("Le dictionnaire n'a pas pu être supprimé.");
            });
    }

    async deleteNameVP(nameVP: NameVP): Promise<void> {
        return this.collection
            .findOneAndDelete({ lastName: nameVP.lastName, firstName: nameVP.firstName })
            .then((res: ModifyResult<NameVP>) => {
                if (!res.value) {
                    throw new Error('Nom introuvable');
                }
            })
            .catch(() => {
                throw new Error("Le nom de ce joueur virtuel n'as pas pu être supprimé");
            });
    }

    async modifyDictionnary(dictionnary: MockDict, formerTitle: string): Promise<void> {
        await this.checkNotSameTitles(dictionnary.title);
        if (!this.sameTitleFound) {
            const filter: Filter<MockDict> = { title: formerTitle };
            const updateFilter: UpdateFilter<MockDict> = { $set: { title: dictionnary.title, description: dictionnary.description } };
            return (
                this.collection
                    .updateOne(filter, updateFilter)
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    .then(() => {})
                    .catch(() => {
                        throw new Error("Le document n'as pas pu être modifié");
                    })
            );
        }
        return;
    }

    async editNameVP(vpName: NameVP, formerVPName: NameVP): Promise<void> {
        // Can also use replaceOne if we want to replace the entire object
        const filter: Filter<NameVP> = { lastName: formerVPName.lastName, firstName: formerVPName.firstName };
        const updateFilter: UpdateFilter<MockDict> = { $set: { lastName: vpName.lastName, firstName: vpName.firstName } };
        return (
            this.collection
                .updateOne(filter, updateFilter)
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                .then(() => {})
                .catch(() => {
                    throw new Error("Le nom du joueur virtuel n'as pas pu être modifié pour non respect des règles de modifications");
                })
        );
    }

    private async checkNotSameTitles(name: string): Promise<void> {
        await this.getAllDictionnaries();
        for (const dict of this.dictionnariesFromDatabase) {
            if (dict.title === name) {
                this.sameTitleFound = true;
                return;
            }
        }
        this.sameTitleFound = false;
        return;
    }
}
