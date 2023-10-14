/* eslint-disable no-console */
import { Collections } from '@app/classes/collections';
import * as GlobalConstants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
import { Score } from '@app/classes/score';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

@Service()
export class DatabaseService {
    dictionnariesCollection: Collections;
    bestScoreClassicCollection: Collections;
    bestScoreLOG2990Collection: Collections;
    beginnerVPNamesCollections: Collections;
    expertVPNamesCollection: Collections;

    namesVP: NameVP[];
    namesVPExpert: NameVP[];
    dictionnariesMock: MockDict[];

    defaultExpertVPNames: NameVP[] = [
        { lastName: 'Weiner', firstName: 'I.M.A', protected: true },
        { lastName: 'Ron', firstName: 'Moe', protected: true },
        { lastName: 'Normousbutt', firstName: 'Maya', protected: true },
    ];

    defaultBeginnerVPNames: NameVP[] = [
        { lastName: 'Oxmol', firstName: 'Mike', protected: true },
        { lastName: 'Jass', firstName: 'Hugh', protected: true },
        { lastName: 'Hwak', firstName: 'Lee', protected: true },
    ];

    private client: MongoClient;
    private db: Db;
    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as MongoClientOptions;

    constructor() {
        this.dictionnariesMock = [];
        this.namesVP = [];
        this.namesVPExpert = [];
    }

    async start(url: string = GlobalConstants.DATABASE_URL): Promise<MongoClient | null> {
        const mongoClient = await MongoClient.connect(url, this.options);
        this.client = mongoClient;
        this.db = mongoClient.db(GlobalConstants.DATABASE_NAME);
        this.dictionnariesCollection = new Collections(this.database, GlobalConstants.DATABASE_COLLECTION_DICTIONNARIES);
        this.bestScoreClassicCollection = new Collections(this.database, GlobalConstants.DATABASE_COLLECTION_BESTSCORECLASSIC);
        this.bestScoreLOG2990Collection = new Collections(this.database, GlobalConstants.DATABASE_COLLECTION_BESTSCORELOG2990);
        this.beginnerVPNamesCollections = new Collections(this.database, GlobalConstants.DATABASE_COLLECTION_BEGINNER_NAMESVP);
        this.expertVPNamesCollection = new Collections(this.database, GlobalConstants.DATABASE_COLLECTION_EXPERT_NAMESVP);
        await this.copyScoreClassic();
        await this.copyScoreLOG2990();
        await this.copyDBDictionnaries();
        await this.copyDBNames();
        await this.copyDBNamesExpert();

        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async addScoreClassicToDb(player: Player) {
        let variable = true;
        const bdClassicScore: Score[] = this.bestScoreClassicCollection.scoreClassicFromDatabase;
        if (player.idPlayer !== 'virtualPlayer') {
            for (const line of bdClassicScore) {
                if (String(player.score) === line.score) {
                    this.bestScoreClassicCollection.collection.updateOne({ score: line.score }, { $push: { name: player.name } });
                    variable = false;
                }
            }
            if (variable) {
                const newLine: Score = { name: [player.name], score: String(player.score) };
                await this.bestScoreClassicCollection.collection.insertOne(newLine);
            }
        }
    }

    async addScoreLog2990ToDb(player: Player) {
        let variable = true;
        const bdLog2990Score: Score[] = this.bestScoreLOG2990Collection.scoreLOG2990FromDatabase;
        if (player.idPlayer !== 'virtualPlayer') {
            for (const line of bdLog2990Score) {
                if (String(player.score) === line.score) {
                    this.bestScoreLOG2990Collection.collection.updateOne({ score: line.score }, { $push: { name: player.name } });
                    variable = false;
                }
            }
            if (variable) {
                const newLine: Score = { name: [player.name], score: String(player.score) };
                await this.bestScoreLOG2990Collection.collection.insertOne(newLine);
            }
        }
    }

    async resetDatabase() {
        await this.resetClassicDb();
        await this.resetLOG2990Db();
        await this.resetAllVPNames();
        await this.resetDictionnaries();
    }

    async updateDBNames() {
        this.namesVP = [];
        this.namesVPExpert = [];
        await this.copyDBNames();
        await this.copyDBNamesExpert();
    }

    async updateDBDict() {
        this.dictionnariesMock = [];
        await this.copyDBDictionnaries();
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

    private async copyDBNamesExpert() {
        await this.expertVPNamesCollection.getAllVPNames();
        const vpNames: NameVP[] = this.expertVPNamesCollection.namesVpFromDatabase;
        for (const name of vpNames) {
            this.namesVPExpert.push({ lastName: name.lastName, firstName: name.firstName, protected: name.protected });
        }
    }

    private async copyDBDictionnaries(): Promise<void> {
        await this.dictionnariesCollection.getAllDictionnaries();
        const dictionnaries: MockDict[] = this.dictionnariesCollection.dictionnariesFromDatabase;
        for (const dict of dictionnaries) {
            this.dictionnariesMock.push({ title: dict.title, description: dict.description });
        }
    }

    private async copyScoreClassic() {
        await this.bestScoreClassicCollection.getScoreClassic();
    }

    private async copyScoreLOG2990() {
        await this.bestScoreLOG2990Collection.getScoreLOG2990();
    }
    private async resetClassicDb() {
        this.bestScoreClassicCollection.collection.deleteMany({});
        const scoreClassicMock: Score[] = [
            { name: ['bestClassic1'], score: '10' },
            { name: ['bestClassic2'], score: '8' },
            { name: ['bestClassic3'], score: '5' },
            { name: ['bestClassic4'], score: '3' },
            { name: ['bestClassic5'], score: '1' },
        ];
        for (const score of scoreClassicMock) {
            await this.bestScoreClassicCollection.collection.insertOne(score);
        }
    }

    private async resetAllVPNames() {
        this.beginnerVPNamesCollections.collection.deleteMany({});
        this.expertVPNamesCollection.collection.deleteMany({});
        for (const expertName of this.defaultExpertVPNames) {
            await this.expertVPNamesCollection.collection.insertOne(expertName);
        }
        for (const beginnerName of this.defaultBeginnerVPNames) {
            await this.beginnerVPNamesCollections.collection.insertOne(beginnerName);
        }
    }

    private async resetLOG2990Db() {
        this.bestScoreLOG2990Collection.collection.deleteMany({});
        const scoreLOG2990Mock: Score[] = [
            { name: ['bestLOG1'], score: '12' },
            { name: ['bestLOG2'], score: '10' },
            { name: ['bestLOG3'], score: '8' },
            { name: ['bestLOG4'], score: '4' },
            { name: ['bestLOG5'], score: '3' },
        ];
        for (const score of scoreLOG2990Mock) {
            await this.bestScoreLOG2990Collection.collection.insertOne(score);
        }
    }

    private async resetDictionnaries() {
        await this.dictionnariesCollection.deleteAllDictionnaries();
    }
}
