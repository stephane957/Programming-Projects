/* eslint-disable */
// @ts-nocheck
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
    dictionarySelected: DictJSON;
    dictionariesFromDatabase: MockDict[];
    namesVpFromDatabase: NameVP[];
    sameTitleFound: boolean = false;

    constructor(private database: Db, private collectionName: string) {
        this.dictionarySelected = { title: '', description: '', words: [] };
        this.scoreLOG2990FromDatabase = [];
    }
    get collection(): Collection {
        return this.database.collection(this.collectionName);
    }

    async getAllDictionaries(): Promise<MockDict[]> {
        this.dictionariesFromDatabase = (await this.collection
            .find({}, { projection: { title: 1, description: 1, _id: 0 } })
            .toArray()) as unknown as MockDict[];
        return this.dictionariesFromDatabase;
    }

    async getAllVPNames(): Promise<NameVP[]> {
        this.namesVpFromDatabase = (await this.collection
            .find({}, { projection: { lastName: 1, firstName: 1, protected: 1, _id: 0 } })
            .toArray()) as unknown as NameVP[];
        return this.namesVpFromDatabase;
    }

    async getDictionary(name: string): Promise<DictJSON> {
        this.dictionarySelected = (await this.collection.findOne({ title: name }, { projection: { _id: 0 } })) as unknown as DictJSON;
        return this.dictionarySelected;
    }

    private async checkNotSameTitles(name: string): Promise<void> {
        await this.getAllDictionaries();
        for (const dict of this.dictionariesFromDatabase) {
            if (dict.title === name) {
                this.sameTitleFound = true;
                return;
            }
        }
        this.sameTitleFound = false;
        return;
    }
}
