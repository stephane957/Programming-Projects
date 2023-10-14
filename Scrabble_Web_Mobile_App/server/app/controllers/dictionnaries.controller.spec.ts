/* eslint-disable*/
import { Application } from '@app/app';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { DatabaseService } from '@app/services/database.service';
import chaiHttp = require('chai-http');
import { Container } from 'typedi';
import { MongoMemoryServer } from 'mongodb-memory-server';

// const HTTP_STATUS_OK = StatusCodes.OK;
const HTTP_STATUS_CREATED = StatusCodes.CREATED;
const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
const expect = chai.expect;
chai.use(chaiHttp);

describe('DictionariesController', () => {
    // let dictionnariesControllerStub: SinonStubbedInstance<DictionariesController>;
    let app: Application;
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    let mongoUri: string;
    beforeEach(async () => {
        databaseService = new DatabaseService();
        mongoServer = new MongoMemoryServer();
        await mongoServer.start();
        mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
        app = Container.get(Application);
        app.bindRoutes();
    });

    it('should return null because the title of the requested dictionary does not exist', async () => {
        chai.request(app.app)
            .get('/')
            .query({ title: 'Dictionnaire français défaut' })
            .end((res) => {
                expect(res).to.be.equal(null);
            });
    });

    it('should return 404 status code because the title of the requested dictionary does not exist', async () => {
        chai.request(app.app)
            .get('/')
            .query({ params: { title: 'Dictionnaire françai défaut' }, reportProgress: true, responseType: 'blob' })
            .then((req: any) => {
                expect(req.query.title).to.equal('Dictionnaire français par défaut');
            })
            .then((res: any) => {
                expect(res).to.have.status(HTTP_STATUS_NOT_FOUND);
            });
    });

    it('should return CREATED status code', async () => {
        chai.request(app.app)
            .post('/')
            .type('json')
            .send({
                title: 'Dictionnaire français par défaut',
                description: 'Tets',
                words: "['mot']",
            })
            .then((res) => {
                expect(res).to.have.status(HTTP_STATUS_CREATED);
            });
    });

    // it('', async () => {});

    // it('should return message from example service on valid get request to root', async () => {
    //     return supertest(expressApp)
    //         .get('/')
    //         .expect(HTTP_STATUS_OK)
    //         .then((response) => {
    //             expect(response.body).to.deep.equal(baseMessage);
    //         });
    // });

    // it('should return message from example service on valid get request to about route', async () => {
    //     const aboutMessage = { ...baseMessage, title: 'About' };
    //     exampleService.about.returns(aboutMessage);
    //     return supertest(expressApp)
    //         .get('/')
    //         .expect(HTTP_STATUS_OK)
    //         .then((response) => {
    //             expect(response.body).to.deep.equal(aboutMessage);
    //         });
    // });

    // it('should store message in the array on valid post request to /send', async () => {
    //     const message: Message = { title: 'Hello', body: 'World' };
    //     return supertest(expressApp).post('/api/example/send').send(message).set('Accept', 'application/json').expect(HTTP_STATUS_CREATED);
    // });

    // it('should return an array of messages on valid get request to /all', async () => {
    //     exampleService.getAllMessages.returns([baseMessage, baseMessage]);
    //     return supertest(expressApp)
    //         .get('/')
    //         .expect(HTTP_STATUS_OK)
    //         .then((response) => {
    //             expect(response.body).to.deep.equal([baseMessage, baseMessage]);
    //         });
    // });
});
