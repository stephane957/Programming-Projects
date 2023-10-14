/* eslint-disable */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
// import { MongoClient } from 'mongodb';
import { Collections } from './collections';
import { DatabaseServiceMock } from './database.service.mock';
import * as globalConstants from '@app/classes/global-constants';
import { DictJSON } from './dict-json';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('Collections class', () => {
    let dictionnariesCollection: Collections;
    let databaseServiceMock: DatabaseServiceMock;
    // let client: MongoClient;
    let testDictionnary: DictJSON;

    beforeEach(async () => {
        databaseServiceMock = new DatabaseServiceMock();
        await databaseServiceMock.start();
        // client = (await databaseServiceMock.start()) as MongoClient;
        dictionnariesCollection = new Collections(databaseServiceMock.database, globalConstants.DATABASE_COLLECTION_DICTIONNARIES);

        testDictionnary = {
            title: 'Dictionnaire de test',
            description: 'Dictionnaire factice crée pour les test unitaires de notre classe Collections',
            words: ['avion', 'bateau', 'chariot', 'desssin', 'euphémisme', 'farine', 'guitare'],
        };
        await dictionnariesCollection.collection.deleteMany({ title: { $nin: ['Dictionnaire français par défaut'] } });
        await dictionnariesCollection.collection.insertOne(testDictionnary);
    });

    afterEach(async () => {
        await databaseServiceMock.closeConnection();
    });

    it('should get all the dictionnaries from the db', async () => {
        let dictionnaries = await dictionnariesCollection.getAllDictionnaries();
        chai.expect(dictionnaries.length).to.equal(2);
        const mock = {title: testDictionnary.title, description: testDictionnary.description};
        chai.expect(mock).to.deep.equal(dictionnaries[1]);
    });
});
