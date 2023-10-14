/* eslint-disable */
import * as globalConstants from '@app/classes/global-constants';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { Collections } from './collections';
import { DatabaseServiceMock } from './database.service.mock';
import { DictJSON } from './dict-json';
import { HttpException } from './http.exception';
import { MockDict } from './mock-dict';
import { NameVP } from './names-vp';
import { Score } from './score';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('Collections class', () => {
    let dictionariesCollection: Collections;
    let bestScoreClassicCollection: Collections;
    let bestScoreLOG2990Collection: Collections;
    let namesVPExpertCollection: Collections;
    let namesVPBeginnerCollection: Collections;
    let databaseServiceMock: DatabaseServiceMock;
    let client: MongoClient;
    let testDictionary: DictJSON;
    let testScore1: Score;
    let testScore2: Score;
    let expertNames: NameVP[];
    let beginnerNames: NameVP[];

    beforeEach(async () => {
        databaseServiceMock = new DatabaseServiceMock();
        // await databaseServiceMock.start();
        client = (await databaseServiceMock.start()) as MongoClient;
        dictionariesCollection = new Collections(databaseServiceMock.database, globalConstants.DATABASE_COLLECTION_DICTIONARIES);
        bestScoreClassicCollection = new Collections(databaseServiceMock.database, globalConstants.DATABASE_COLLECTION_BESTSCORECLASSIC);
        bestScoreLOG2990Collection = new Collections(databaseServiceMock.database, globalConstants.DATABASE_COLLECTION_BESTSCORELOG2990);
        namesVPExpertCollection = new Collections(databaseServiceMock.database, globalConstants.DATABASE_COLLECTION_EXPERT_NAMESVP);
        namesVPBeginnerCollection = new Collections(databaseServiceMock.database, globalConstants.DATABASE_COLLECTION_BEGINNER_NAMESVP);

        testDictionary = {
            title: 'Dictionnaire de test',
            description: 'Dictionnaire factice crée pour les test unitaires de notre classe Collections',
            words: ['avion', 'bateau', 'chariot', 'desssin', 'euphémisme', 'farine', 'guitare'],
        };
        testScore1 = { name: ['Player1', 'Player3'], score: '65' };
        testScore2 = { name: ['Player2', 'Player4', 'Player6'], score: '55' };
        expertNames = [
            { lastName: 'Weiner', firstName: 'I.M.A', protected: true },
            { lastName: 'Ron', firstName: 'Moe', protected: true },
            { lastName: 'Normousbutt', firstName: 'Maya', protected: true },
        ];
        beginnerNames = [
            { lastName: 'Weiner', firstName: 'I.M.A', protected: true },
            { lastName: 'Ron', firstName: 'Moe', protected: true },
            { lastName: 'Normousbutt', firstName: 'Maya', protected: true },
        ];
        await dictionariesCollection.collection.insertOne(testDictionary);
        await bestScoreClassicCollection.collection.insertMany([testScore1, testScore2]);
        await bestScoreLOG2990Collection.collection.insertMany([testScore1, testScore2]);
        await namesVPBeginnerCollection.collection.insertMany(beginnerNames);
        await namesVPExpertCollection.collection.insertMany(expertNames);
    });

    afterEach(async () => {
        await databaseServiceMock.closeConnection();
    });

    it('should get all the dictionaries from the db', async () => {
        const dictionaries = await dictionariesCollection.getAllDictionaries();
        expect(dictionaries.length).to.equal(1);
        const mock = { title: testDictionary.title, description: testDictionary.description };
        expect(mock).to.deep.equal(dictionaries[0]);
    });

    it('should delete all dictionaries from db except the default french dictionary', async () => {
        const defaultDictionaryMock = {
            title: 'Dictionnaire français par défaut',
            description: 'Test de suppression de tous les dictionnaires',
            words: ['mot', 'de', 'test', 'français'],
        };
        await dictionariesCollection.collection.insertOne(defaultDictionaryMock);
        await dictionariesCollection.deleteAllDictionaries();
        const dictionaries = await dictionariesCollection.getAllDictionaries();
        expect(dictionaries.length).to.be.equal(1);
        expect(dictionaries[0].title).to.be.equal('Dictionnaire français par défaut');
    });

    it('should get the correct dictionary with getDictionary', async () => {
        let dictionary = await dictionariesCollection.getDictionary(testDictionary.title);
        expect(dictionary.title).to.equal(testDictionary.title);
        await dictionariesCollection.collection.deleteMany({});
        await dictionariesCollection.collection.insertMany([
            { title: 'Premier titre test', description: 'Description de tests', words: ['pour', 'la', 'classe', 'collection'] },
            {
                title: 'Deuxième titre test',
                description: 'Description de 2',
                words: ['pour', 'la', 'classe', 'collection', 'deux', 'dictionnaires'],
            },
            { title: 'Troisième titre test', description: 'Description de tests3', words: ['pour', 'classe', 'collection', 'disco'] },
        ]);
        dictionary = await dictionariesCollection.getDictionary(testDictionary.title);
        expect(dictionary).to.be.equal(null);
        dictionary = await dictionariesCollection.getDictionary('Premier titre test');
        expect(dictionary.description).to.be.equal('Description de tests');
        expect(dictionary.words[0]).to.equal('pour');
    });

    it('should add a correct dictionary with the addDictionary() method', async () => {
        const secondDictionary = {
            title: 'Premier titre test',
            description: 'Description de tests',
            words: ['pour', 'classe', 'collection', 'test'],
        };

        await dictionariesCollection.addDictionary(secondDictionary);
        const dictionaries = await dictionariesCollection.collection.find({}).toArray();

        expect(dictionaries.length).to.equal(2);
        expect(dictionaries.find((x) => x.title === secondDictionary.title)).to.deep.equals(secondDictionary);
    });

    it('should not add an incorrect dictionary with the addDicitonary() method', async () => {
        const badDictionary = { title: 'Mauvais t1tre', description: 'mauva1se description*', words: ['mauvais', 'dictionnaire', 'mais'] };
        try {
            await dictionariesCollection.addDictionary(badDictionary);
        } catch (error) {
            const dictionaries = await dictionariesCollection.collection.find({}).toArray();
            expect(dictionaries.length).to.equal(1);
        }
    });

    it('should not add a dictionary if one with the same title already exists', async () => {
        const sameDictionary = {
            title: 'Dictionnaire de test',
            description: 'Dictionnaire factice crée pour les test unitaires de notre classe Collections',
            words: ['avion', 'bateau', 'chariot', 'desssin', 'euphémisme', 'farine', 'guitare'],
        };
        try {
            expect(await dictionariesCollection.addDictionary(sameDictionary)).to.throw();
        } catch (error) {
            const dictionaries = await dictionariesCollection.collection.find({}).toArray();
            expect(dictionaries.length).to.not.equal(2);
            expect(error.message).to.equal(
                'Un dictionaire au titre identique à celui que vous avez tenté de téléverser existe déjà.\n Saisissez un autre titre.',
            );
        }
    });

    it('should correctly delete a dictionary if a valid title is sent', async () => {
        const secondDictionary = {
            title: 'Premier titre test',
            description: 'Description de tests',
            words: ['pour', 'classe', 'collection', 'test'],
        };

        await dictionariesCollection.collection.insertOne(secondDictionary);

        await dictionariesCollection.deleteDictionary(secondDictionary.title);
        const dictionaries = await dictionariesCollection.collection.find({}).toArray();
        expect(dictionaries.length).to.equal(1);
        expect(dictionaries[1]).to.be.equal(undefined);
    });

    it('should not delete a dictionary if a invalid title is sent', async () => {
        const thirdDictionary = { title: 'Petit', description: 'Petite', words: ['rien'] };

        await dictionariesCollection.collection.insertOne(thirdDictionary);

        try {
            expect(await dictionariesCollection.deleteDictionary('mauvais titre')).to.throw();
        } catch (error) {
            const dictionaries = await dictionariesCollection.collection.find({}).toArray();
            expect(dictionaries.length).to.equal(2);
        }
    });

    it('should modify an existing dictionary if a valid title and description are sent', async () => {
        await dictionariesCollection.modifyDictionary(
            { title: 'Nouveau dictionnaire de test', description: 'Nouvelle description' },
            testDictionary.title,
        );
        const dictionaries = await dictionariesCollection.collection.find({}).toArray();
        expect(dictionaries.length).to.equal(1);
        expect(dictionaries[0].title).to.not.eq(testDictionary.title);
        expect(dictionaries[0].description).to.not.eql(testDictionary.description);
    });

    it('should not modify an existing dictionary if the same title is sent', async () => {
        const dictionnary = { title: testDictionary.title, description: 'Nouvelle description' };
        try {
            expect(await dictionariesCollection.modifyDictionary(dictionnary, testDictionary.title)).to.throw();
        } catch (error) {
            const dictionaries = await dictionariesCollection.collection.find({}).toArray();
            expect(dictionaries.find((x) => x.title === testDictionary.title)?.description).to.not.equals(dictionnary.description);
        }
    });

    it('should not modify existing dictionary if the title and/or description are incorrrect', async () => {
        const badDictionary = { title: 'Mauvais t1tre', description: 'mauva1se description*' };
        try {
            expect(await dictionariesCollection.modifyDictionary(badDictionary, testDictionary.title)).to.throw();
        } catch (error) {
            const dictionaries = await dictionariesCollection.collection.find({}).toArray();
            expect(dictionaries.find((x) => x.title === testDictionary.title)?.description).to.not.equals(badDictionary.description);
        }
    });

    it('checkNotSameTitles returns true if an other dictionary has the same title', async () => {
        await dictionariesCollection['checkNotSameTitles'](testDictionary.title);
        expect(dictionariesCollection.sameTitleFound).to.be.true;
    });

    it('checkNotSameTitles returns false if no other dictionary has the same title', async () => {
        await dictionariesCollection['checkNotSameTitles']('Autre titre');
        expect(dictionariesCollection.sameTitleFound).to.be.false;
    });

    it('should get all the virtual player names ', async () => {
        const experts = await namesVPBeginnerCollection.getAllVPNames();
        const beginners = await namesVPExpertCollection.getAllVPNames();
        const threeNames = 3;
        expect(beginners.length).to.equal(threeNames);
        expect(experts.length).to.equal(threeNames);
    });

    it('should add correctly a name for both beginner and expert virtual player', async () => {
        const newBeginner = { firstName: 'Larry', lastName: 'Bird', protected: false };
        const newExpert = { firstName: 'Magic', lastName: 'Johnson', protected: false };

        await namesVPBeginnerCollection.addNameVP(newBeginner);
        await namesVPExpertCollection.addNameVP(newExpert);

        const experts = await namesVPBeginnerCollection.getAllVPNames();
        const beginners = await namesVPExpertCollection.getAllVPNames();

        const fourNames = 4;
        expect(beginners.length).to.equal(fourNames);
        expect(experts.length).to.equal(fourNames);
    });

    it('should delete correctly a name added before', async () => {
        const newBeginner: NameVP = { firstName: 'Larry', lastName: 'Bird', protected: false };
        const newExpert: NameVP = { firstName: 'Magic', lastName: 'Johnson', protected: false };

        await namesVPBeginnerCollection.collection.insertOne(newBeginner);
        await namesVPExpertCollection.collection.insertOne(newExpert);

        await namesVPBeginnerCollection.deleteNameVP(newBeginner);
        await namesVPBeginnerCollection.deleteNameVP(beginnerNames[0]);
        await namesVPExpertCollection.deleteNameVP(newExpert);
        await namesVPExpertCollection.deleteNameVP(expertNames[0]);

        const experts = await namesVPBeginnerCollection.getAllVPNames();
        const beginners = await namesVPExpertCollection.getAllVPNames();

        const twoNames = 2;
        expect(beginners.length).to.equal(twoNames);
        expect(experts.length).to.equal(twoNames);
    });

    it('should throw error if we try to delete an inexisting name', async () => {
        const errorMessage = "Le nom de ce joueur virtuel n'as pas pu être supprimé";
        const nonExistingName: NameVP = { firstName: 'No', lastName: 'body', protected: false };
        try {
            expect(await namesVPBeginnerCollection.deleteNameVP(nonExistingName)).to.throw(errorMessage);
            expect(await namesVPExpertCollection.deleteNameVP(nonExistingName)).to.throw(errorMessage);
        } catch (error) {
            const experts = await namesVPBeginnerCollection.getAllVPNames();
            const beginners = await namesVPExpertCollection.getAllVPNames();
            const threeNames = 3;
            expect(beginners.length).to.equal(threeNames);
            expect(experts.length).to.equal(threeNames);
        }
    });

    it('should edit the name of the virtual player correctly regardless of if it is beginner or expert', async () => {
        const newBeginner: NameVP = { firstName: 'Larry', lastName: 'Bird', protected: true };
        const newExpert: NameVP = { firstName: 'Magic', lastName: 'Johnson', protected: true };

        await namesVPBeginnerCollection.editNameVP(newBeginner, beginnerNames[0]);
        await namesVPExpertCollection.editNameVP(newExpert, expertNames[0]);
        const experts = await namesVPExpertCollection.getAllVPNames();
        const beginners = await namesVPBeginnerCollection.getAllVPNames();

        expect(experts.length).to.equal(3);
        expect(beginners.length).to.equal(3);
        expect(experts[0]).to.be.eql(newExpert);
        expect(beginners[0]).to.be.eql(newBeginner);
    });

    it('should not edit the name if the previous name does not exist in the collection', async () => {
        const errorMessage = "Le nom du joueur virtuel n'as pas pu être modifié pour non respect des règles de modifications";
        const newBeginner: NameVP = { firstName: 'Larry', lastName: 'Bird', protected: true };
        const newExpert: NameVP = { firstName: 'Magic', lastName: 'Johnson', protected: true };
        try {
            expect(await namesVPBeginnerCollection.editNameVP(beginnerNames[0], newBeginner)).to.throw(errorMessage);
            expect(await namesVPExpertCollection.editNameVP(expertNames[0], newExpert)).to.throw(errorMessage);
        } catch (error) {
            const experts = await namesVPBeginnerCollection.getAllVPNames();
            const beginners = await namesVPExpertCollection.getAllVPNames();
            const threeNames = 3;
            expect(beginners.length).to.equal(threeNames);
            expect(experts.length).to.equal(threeNames);
        }
    });

    it('should get the best scores from the db', async () => {
        const scoreClassic = await bestScoreClassicCollection.getScoreClassic();
        const scoreLOG2990 = await bestScoreLOG2990Collection.getScoreLOG2990();
        chai.expect(scoreClassic.length).to.equal(2);
        chai.expect(scoreLOG2990.length).to.equal(2);
    });

    // Error handling
    describe('Error handling', async () => {
        it('should throw an error if we try to get all dictionaries/namesVP/scores with a closed connection', async () => {
            await client.close();
            expect(dictionariesCollection.getAllDictionaries()).to.eventually.be.rejectedWith(Error);
            expect(namesVPBeginnerCollection.getAllVPNames()).to.eventually.be.rejectedWith(Error);
            expect(bestScoreClassicCollection.getScoreClassic()).to.eventually.be.rejectedWith(Error);
            expect(bestScoreLOG2990Collection.getScoreLOG2990()).to.eventually.be.rejectedWith(Error);
        });

        it('should throw an http error if we try to add a dictionary/nameVP with a closed connection', async () => {
            await client.close();
            const dict: DictJSON = {
                title: 'Premier titre test',
                description: 'Description de tests',
                words: ['pour', 'la', 'classe', 'collection'],
            };

            const newName: NameVP = { firstName: 'Larry', lastName: 'Bird', protected: false };
            expect(dictionariesCollection.addDictionary(dict)).to.eventually.be.rejectedWith(HttpException);
            expect(namesVPBeginnerCollection.addNameVP(newName)).to.eventually.be.rejectedWith(HttpException);
        });

        it('should throw an error if we try to modify a dictionary with a closed connection', async () => {
            await client.close();
            const errorMessage = "Le document n'as pas pu être modifié";
            const newDict: MockDict = { title: 'Nouveau dictionnaire de test', description: 'Nouvelle description' };

            expect(dictionariesCollection.modifyDictionary(newDict, testDictionary.title)).to.eventually.be.rejectedWith(Error(errorMessage));
        });

        it('should throw an error if we try to edit a nameVP with a closed connection', async () => {
            await client.close();
            const errorMessage = "Le nom du joueur virtuel n'as pas pu être modifié pour non respect des règles de modifications";
            const newName: NameVP = { firstName: 'Larry', lastName: 'Bird', protected: false };
            expect(namesVPExpertCollection.editNameVP(newName, beginnerNames[0])).to.eventually.be.rejectedWith(Error(errorMessage));
        });
    });
});
