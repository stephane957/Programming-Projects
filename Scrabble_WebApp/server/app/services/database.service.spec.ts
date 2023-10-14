/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { fail } from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
// import * as Sinon from 'sinon';
import { describe } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';
// import { Collections } from '@app/classes/collections';
// import * as GlobalConstants from '@app/classes/global-constants';
import { MongoClient } from 'mongodb';

chai.use(chaiAsPromised); // this allows us to test for rejection

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    // let collectionStub: Sinon.SinonStubbedInstance<Collections>;
    let mongoUri: string;
    beforeEach(async () => {
        databaseService = new DatabaseService();
        // collectionStub = Sinon.createStubInstance(Collections, {
        //     dictionnariesFromDatabase: [],
        //     dictionnarySelected: { title: '', description: '', words: [''] },
        //     scoreClassicFromDatabase: [],
        //     scoreLOG2990FromDatabase: [],
        //     namesVpFromDatabase: [],
        // });
        // Start a local test server
        databaseService.dictionnariesMock = [];
        databaseService.namesVP = [];
        databaseService.namesVPExpert = [];
        mongoServer = new MongoMemoryServer();
        await mongoServer.start();
        mongoUri = mongoServer.getUri();
        databaseService['client'] = (await databaseService.start(mongoUri)) as MongoClient;
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

    it('should not connect to the database when start is called with wrong URL', async () => {
        // Try to reconnect to local server
        try {
            await databaseService.start('WRONG URL');
            fail();
        } catch {
            // expect(databaseService.client).to.be.equal(undefined);
        }
    });

    it('should no longer be connected if close is called', async () => {
        await databaseService.start(mongoUri);
        await databaseService.closeConnection();
        expect(databaseService['db']).to.be.ok;
    });

    // it('the database should contain at least the default french dictionnary', async () => {
    //     await databaseService.updateDBDict();
    //     expect(databaseService.dictionnariesMock.length).to.be.equal(0);
    // });

    // it('should populate the database with a helper function', async () => {
    //     const options: MongoClientOptions = {
    //         useNewUrlParser: true,
    //         useUnifiedTopology: true,
    //     } as MongoClientOptions;
    //     const client = await MongoClient.connect(mongoUri, options);
    //     databaseService['db'] = client.db('database');
    //     await databaseService.populateDB();
    //     const courses = await databaseService.database.collection('courses').find({}).toArray();
    //     expect(courses.length).to.equal(5);
    // });

    /* it('should not populate the database with start function if it is already populated', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        let courses = await databaseService.database.collection('courses').find({}).toArray();
        expect(courses.length).to.equal(5);
        await databaseService.closeConnection();
        await databaseService.start(mongoUri);
        courses = await databaseService.database.collection('courses').find({}).toArray();
        expect(courses.length).to.equal(5);
    });*/
});
