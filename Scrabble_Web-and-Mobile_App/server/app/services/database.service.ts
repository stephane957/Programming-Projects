/* eslint-disable no-console */
import { Collections } from '@app/classes/collections';
import * as GlobalConstants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

@Service()
export class DatabaseService {
    dictionariesCollection: Collections;
    beginnerVPNamesCollections: Collections;

    namesVP: NameVP[];
    dictionariesMock: MockDict[];

    defaultBeginnerVPNames: NameVP[] = [
        { lastName: 'Oxmol', firstName: 'Mike', protected: true },
        { lastName: 'Lecter', firstName: 'Hannibal', protected: true },
        { lastName: 'Hwak', firstName: 'Lee', protected: true },
    ];

    private client: MongoClient;
    private db: Db;
    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as MongoClientOptions;

    constructor() {
        this.dictionariesMock = [];
        this.namesVP = [];
    }

    async start(url: string = GlobalConstants.DATABASE_URL): Promise<MongoClient | null> {
        const mongoClient = await MongoClient.connect(url, this.options);
        this.client = mongoClient;
        this.db = mongoClient.db(GlobalConstants.DATABASE_DEV);
        this.dictionariesCollection = new Collections(this.database, GlobalConstants.DATABASE_COLLECTION_DICTIONARIES);
        this.beginnerVPNamesCollections = new Collections(this.database, GlobalConstants.DATABASE_COLLECTION_BEGINNER_NAMESVP);
        await this.updateAllCollections();

        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async updateAllCollections() {
        await this.copyDBDictionaries();
        await this.copyDBNames();
    }

    get database(): Db {
        return this.db;
    }
    private async copyDBNames() {
        await this.beginnerVPNamesCollections.getAllVPNames();
        const vpNames: NameVP[] = this.beginnerVPNamesCollections.namesVpFromDatabase;
        for (const name of vpNames) {
            this.namesVP.push({ lastName: name.lastName, firstName: name.firstName, protected: name.protected });
        }
    }

    private async copyDBDictionaries(): Promise<void> {
        await this.dictionariesCollection.getAllDictionaries();
        const dictionaries: MockDict[] = this.dictionariesCollection.dictionariesFromDatabase;
        for (const dict of dictionaries) {
            this.dictionariesMock.push({ title: dict.title, description: dict.description });
        }
    }
}
