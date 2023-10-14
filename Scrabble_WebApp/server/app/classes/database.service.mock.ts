import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as globalConstants from '@app/classes/global-constants';

export class DatabaseServiceMock {
    mongoServer: MongoMemoryServer;
    private db: Db;
    private client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as MongoClientOptions;

    async start(): Promise<MongoClient | null> {
        if (!this.client) {
            this.mongoServer = new MongoMemoryServer();
            const mongoUri = globalConstants.DATABASE_URL;
            this.client = await MongoClient.connect(mongoUri, this.options);
            this.db = this.client.db(globalConstants.DATABASE_NAME);
        }

        return this.client;
    }

    async closeConnection(): Promise<void> {
        if (this.client) {
            return this.client.close();
        } else {
            return Promise.resolve();
        }
    }

    get database(): Db {
        return this.db;
    }
}
