/* eslint-disable */
import { DictJSON } from '@app/classes/dict-json';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';

chai.use(chaiAsPromised); // this allows us to test for rejection

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    let mongoUri: string;
    let player: Player;
    let player2: Player;

    const testDictionary: DictJSON = {
        title: 'Dictionnaire français par défaut',
        description: 'Dictionnaire factice crée pour les test unitaires de notre classe Collections',
        words: ['avion', 'bateau', 'chariot', 'desssin', 'euphémisme', 'farine', 'guitare'],
    };

    const expertNames: NameVP[] = [
        { lastName: 'Jordan', firstName: 'Michael', protected: true },
        { lastName: 'James', firstName: 'LeBron', protected: true },
        { lastName: 'Jonhson', firstName: 'Magic', protected: true },
    ];
    const beginnerNames: NameVP[] = [
        { lastName: 'Leonard', firstName: 'Kawhi', protected: true },
        { lastName: 'Antetokoumpo', firstName: 'Giannis', protected: true },
        { lastName: 'Curry', firstName: 'Stephen', protected: true },
    ];

    const testScore1 = { name: ['Player1', 'Player3'], score: '65' };
    const testScore2 = { name: ['Player2', 'Player4', 'Player6'], score: '55' };

    beforeEach(async () => {
        databaseService = new DatabaseService();
        player = new Player('Amir');
        player2 = new Player('Rayan');
        mongoServer = new MongoMemoryServer();
        await mongoServer.start();
        mongoUri = mongoServer.getUri();
        databaseService['client'] = (await databaseService.start(mongoUri)) as MongoClient;
        player.idPlayer = '#7567';
    });

    afterEach(async () => {
        if (databaseService['db']) {
            await databaseService.closeConnection();
        }
    });

    // NB : We dont test the case when DATABASE_URL is used in order to not connect to the real database
    it('should connect to the database when start is called', async () => {
        // Reconnect to local server
        await databaseService.start(mongoUri);
        expect(databaseService['client']).to.not.be.equal(undefined);
        expect(databaseService['db'].databaseName).to.equal('Project-Database');
    });

    it('should no longer be connected if close is called', async () => {
        await databaseService.start(mongoUri);
        await databaseService.closeConnection();
        expect(databaseService['db']).to.be.ok;
    });

    it('the dictionary collection should contain no dictionaries', async () => {
        await databaseService.updateDBDict();
        expect(databaseService.dictionariesMock.length).to.be.equal(0);
    });

    it('should add a new line in the bestScoreClassic database if the score is different, and just add the score if the score exists already', async () => {
        await databaseService.bestScoreClassicCollection.collection.insertMany([testScore1, testScore2]);
        player.score = 100;
        player2.score = 55;
        await databaseService.addScoreClassicToDb(player);
        const bestScoreClassic = databaseService.bestScoreClassicCollection.collection.find({}).toArray();
        expect((await bestScoreClassic).length).to.eql(3);
        await databaseService.addScoreClassicToDb(player2);
        expect((await bestScoreClassic).length).to.eql(3);
    });

    it('should add a new line in the bestScoreLOG2990 database if the score is different, and just add the score if the score exists already', async () => {
        await databaseService.bestScoreLOG2990Collection.collection.insertMany([testScore1, testScore2]);
        player.score = 100;
        player2.score = 65;
        await databaseService.addScoreLog2990ToDb(player);
        const bestScoreLOG2990 = databaseService.bestScoreLOG2990Collection.collection.find({}).toArray();

        expect((await bestScoreLOG2990).length).to.eql(3);
        await databaseService.addScoreLog2990ToDb(player2);
        expect((await bestScoreLOG2990).length).to.eql(3);
    });

    it('should reset the namesVP collections to their default state', async () => {
        await databaseService.beginnerVPNamesCollections.collection.insertMany(beginnerNames);
        await databaseService.expertVPNamesCollection.collection.insertMany(expertNames);

        await databaseService['resetAllVPNames']();

        await databaseService.beginnerVPNamesCollections.getAllVPNames();
        expect(databaseService.beginnerVPNamesCollections.namesVpFromDatabase.length).to.be.equal(3);
    });

    it('should reset dictionaries collection to its default state', async () => {
        await databaseService.dictionariesCollection.collection.insertOne(testDictionary);
        await databaseService.dictionariesCollection.collection.insertOne({
            title: 'Dictionnaire factice',
            description: 'Description bidon',
            words: ['rien', 'du', 'tout'],
        });
        await databaseService['resetDictionaries']();

        await databaseService.dictionariesCollection.getAllDictionaries();
        expect(databaseService.dictionariesCollection.dictionariesFromDatabase.length).to.be.equal(1);
    });

    it('should reset the best scorers collections to their default state', async () => {
        await databaseService['resetLOG2990Db']();
        await databaseService['resetClassicDb']();

        await databaseService.bestScoreClassicCollection.getScoreClassic();
        await databaseService.bestScoreLOG2990Collection.getScoreLOG2990();

        expect(databaseService.bestScoreClassicCollection.scoreClassicFromDatabase.length).to.be.equal(5);
        expect(databaseService.bestScoreLOG2990Collection.scoreLOG2990FromDatabase.length).to.be.equal(5);
    });

    it('should update the recently added names to the array from database', async () => {
        await databaseService.beginnerVPNamesCollections.collection.insertMany(beginnerNames);
        await databaseService.expertVPNamesCollection.collection.insertMany(expertNames);
        expect(databaseService.beginnerVPNamesCollections.namesVpFromDatabase.length).to.equal(0);

        await databaseService.updateDBNames();
        expect(databaseService.namesVPExpert.length).to.equal(3);
        expect(databaseService.namesVP.length).to.be.equal(3);
    });

    it('should update the recently added dictionaries from database', async () => {
        expect(databaseService.dictionariesMock.length).to.equal(0);
        await databaseService.dictionariesCollection.collection.insertOne(testDictionary);
        await databaseService.dictionariesCollection.collection.insertOne({
            title: 'Dictionnaire factice',
            description: 'Description bidon',
            words: ['rien', 'du', 'tout'],
        });

        await databaseService.updateDBDict();
        expect(databaseService.dictionariesMock.length).to.be.eql(2);
        expect(databaseService.dictionariesCollection.dictionariesFromDatabase[0].title).to.be.equal(testDictionary.title);
    });

    it('should reset ALL collections to their default states', async () => {
        await databaseService.dictionariesCollection.collection.insertOne(testDictionary);
        await databaseService.dictionariesCollection.collection.insertOne({
            title: 'Dictionnaire factice',
            description: 'Description bidon',
            words: ['rien', 'du', 'tout'],
        });
        await databaseService.bestScoreClassicCollection.collection.insertOne(testScore1);
        await databaseService.bestScoreLOG2990Collection.collection.insertOne(testScore2);
        await databaseService.beginnerVPNamesCollections.collection.insertMany(beginnerNames);
        await databaseService.expertVPNamesCollection.collection.insertMany(expertNames);

        await databaseService.resetDatabase();

        await databaseService.updateAllCollections();
        expect(databaseService.bestScoreClassicCollection.scoreClassicFromDatabase.length).to.be.equal(5);
        expect(databaseService.bestScoreLOG2990Collection.scoreLOG2990FromDatabase.length).to.be.equal(5);
        expect(databaseService.beginnerVPNamesCollections.namesVpFromDatabase.length).to.be.equal(3);
        expect(databaseService.dictionariesCollection.dictionariesFromDatabase.length).to.be.equal(1);
    });
});
