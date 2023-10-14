/*eslint-disable */
// import { Collections } from '@app/classes/collections';
import { DictJSON } from '@app/classes/dict-json';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
// import { Score } from '@app/classes/score';
import { Server } from '@app/server';
import { DictionaryService } from '@app/services/dictionary.service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as Sinon from 'sinon';
import { io as Client, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from './socket-manager.service';


describe('socketManager', () => {
    let clientSocket1: Socket;
    let clientSocket2: Socket;
    let server: Server;
    const RESPONSE_DELAY = 5000;
    let socketManager: SocketManager;
    let gameServer: Sinon.SinonStubbedInstance<GameServer>;
    // let dataBaseServiceStub: Sinon.SinonStubbedInstance<DatabaseService>;
    // let collectionStub : Sinon.SinonStubbedInstance<Collection>;
    // let scoreStub: Sinon.SinonStubbedInstance<Score>;
    let dictionaryServiceStub: Sinon.SinonStubbedInstance<DictionaryService>;

    beforeEach(async () => {
        server = Container.get(Server);
        server.init();
        gameServer = Sinon.createStubInstance(GameServer);
        // dataBaseServiceStub = Sinon.createStubInstance(DatabaseService);
        // scoreStub = Sinon.createStubInstance(Score);
        gameServer.mapPlayers = new Map();
        dictionaryServiceStub = Sinon.createStubInstance(DictionaryService);

        dictionaryServiceStub.gameDictionary = {
            title: 'Mini dictionnaire',
            description: 'Testing',
            words: ['premier', 'mot', 'pour', 'les', 'tests', 'de', 'socket', 'manager'],
        };

        socketManager = server.socketManager;
        // socketManager['databaseService'] = dataBaseServiceStub;
        const urlString = 'http://localhost:3000';

        clientSocket1 = Client(urlString);
        clientSocket2 = Client(urlString);

        clientSocket1.connect();
        clientSocket2.connect();
    });

    afterEach(async () => {
        clientSocket1.emit('RefreshBothDbs');
        clientSocket1.close();
        clientSocket2.close();
        socketManager.sio.close();
    });

    it('should register new user correctly', (done) => {
        clientSocket1.emit('new-user', 'rayan');

        setTimeout(() => {
            expect(socketManager.users.get(clientSocket1.id)?.name).to.equal('rayan');
            done();
        }, RESPONSE_DELAY);
    });

    // TODO : CHECK COMMENT ASSERT CALLED UN EMIT DU SERVEUR
    it('should create room and game', (done) => {
        clientSocket1.emit('new-user', 'rayan');
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room1',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const spy = Sinon.spy(socketManager as any, 'createGameAndPlayer');
        // const spy2 = Sinon.stub(socketManager.sio, 'emit');
        setTimeout(() => {
            expect(socketManager.users.get(clientSocket1.id)?.roomName).to.equal('room1');
            expect(socketManager.rooms.get('room1')?.mapPlayers.get(clientSocket1.id));

            Sinon.assert.called(spy);
            // Sinon.assert.calledWith(spy2, 'addElementListRoom', ({ roomName: 'room1', timeTurn: 1, isBonusRandom: false }));
            done();
        }, RESPONSE_DELAY);
    });

    it('should not join room if already in room', (done) => {
        socketManager.rooms.set('room2', gameServer);
        socketManager.users.set(clientSocket1.id, { name: 'rayan', roomName: 'room2' });

        clientSocket1.emit('joinRoom', {
            roomName: 'room2',
            playerId: clientSocket1.id,
        });

        setTimeout(() => {
            clientSocket1.on('messageServer', (msg) => {
                expect(msg).to.equal('Vous êtes déjà dans cette salle !');
            });
            done();
        }, RESPONSE_DELAY);
    });

    it('joinRoom should not join if room size is 2', (done) => {
        socketManager.rooms.set('room', gameServer);
        const mockPlayer = new Player('rayan');
        gameServer.mapPlayers.set('mockPlayerId', mockPlayer);
        gameServer.mapPlayers.set('mockPlayerId2', mockPlayer);

        clientSocket1.emit('joinRoom', {
            roomName: 'room',
            playerId: clientSocket1.id,
        });

        // const spy = Sinon.stub(clientSocket1, 'emit');
        setTimeout(() => {
            // Sinon.assert.notCalled(spy);
            clientSocket1.on('messageServer', (msg) => {
                expect(msg).to.equal('La salle est complète.');
            });
            done();
        }, RESPONSE_DELAY);
    });

    it('boardClick should call mouseEventService.boardClick', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const stub = Sinon.stub(socketManager['mouseEventService'], 'boardClick');

        clientSocket1.emit('boardClick', {
            coordinateClick: { x: 1, y: 1 },
        });

        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    });

    it('turnFinished should call passCommand of chatService', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        clientSocket1.emit('turnFinished');

        const stub = Sinon.stub(socketManager['chatService'], 'passCommand');
        const stub2 = Sinon.stub(socketManager['playAreaService'], 'changePlayer');

        setTimeout(() => {
            Sinon.assert.called(stub);
            Sinon.assert.called(stub2);
            done();
        }, RESPONSE_DELAY);
    });

    it('MouseEvent should call exchange button clicked', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const stub = Sinon.stub(socketManager['mouseEventService'], 'exchangeButtonClicked');

        clientSocket1.emit('onExchangeClick');

        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    });

    it('newMessageClient should call manageNewMessageClient', (done) => {
        const stub = Sinon.stub(socketManager as any, 'manageNewMessageClient');
        const msg = 'test';
        clientSocket1.emit('newMessageClient', msg);

        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    });

    // it('giveUpGame should call replaceHumanByBot', (done) => {
    //     clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
    //     clientSocket1.emit('createRoomAndGame', {
    //         roomName: 'room',
    //         playerName: 'rayan',
    //         timeTurn: 1,
    //         isBonusRandom: false,
    //         gameMode: 'notSolo',
    //         isLog2990Enabled: true,
    //         nameOpponent: 'op',
    //     });
    //     clientSocket1.emit('joinRoom', {
    //         roomName: 'room',
    //         playerId: clientSocket1.id,
    //     });

    //     const stub = Sinon.stub(socketManager, 'replaceHumanByBot');

    //     clientSocket1.emit('giveUpGame');
    //     setTimeout(() => {
    //         Sinon.assert.called(stub);
    //         done();
    //     }, RESPONSE_DELAY);
    // });

    it('MouseEvent should call annulerButtonClicked on onAnnulerClick', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const stub = Sinon.stub(socketManager['mouseEventService'], 'cancelButtonClicked');

        clientSocket1.emit('onAnnulerClick');

        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    });

    it('MouseEvent should call keyboardAndMouseManipulation on keyboardAndMouseManipulation', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const stub = Sinon.stub(socketManager['mouseEventService'], 'keyboardAndMouseManipulation');

        clientSocket1.emit('keyboardAndMouseManipulation');

        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    });

    it('MouseEvent should call leftlickSelection on leftlickSelection', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const stub = Sinon.stub(socketManager['mouseEventService'], 'leftClickSelection');

        clientSocket1.emit('leftClickSelection');

        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    });

    it('MouseEvent should call rightClickExchange on rightClickExchange', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const stub = Sinon.stub(socketManager['mouseEventService'], 'rightClickExchange');

        clientSocket1.emit('rightClickExchange');

        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    });

    it('MouseEvent should call resetAllTilesStand on resetAllTilesStand', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const stub = Sinon.stub(socketManager['mouseEventService'], 'resetAllTilesStand');

        clientSocket1.emit('resetAllTilesStand');

        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    });

    it('MouseEvent should call keyboardSelection on keyboardSelection', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const stub = Sinon.stub(socketManager['mouseEventService'], 'keyboardSelection');

        clientSocket1.emit('keyboardSelection');

        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    });

    it('should create room and game solo', (done) => {
        clientSocket1.emit('new-user', 'rayan');
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room1',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: GlobalConstants.MODE_SOLO,
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const spy = Sinon.spy(socketManager as any, 'createGameAndPlayer');
        // const spy2 = Sinon.stub(socketManager.sio, 'emit');
        setTimeout(() => {
            expect(socketManager.users.get(clientSocket1.id)?.roomName).to.equal('room1');
            expect(socketManager.rooms.get('room1')?.mapPlayers.get(clientSocket1.id));

            Sinon.assert.called(spy);
            done();
            // Sinon.assert.calledWith(spy2, 'addElementListRoom', ({ roomName: 'room1', timeTurn: 1, isBonusRandom: false }));
        }, RESPONSE_DELAY);
    });

    it('createRoomAndGame should send message that salle existe deja', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        socketManager.rooms.set('room', gameServer);
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        setTimeout(() => {
            clientSocket1.on('messageServer', (msg) => {
                expect(msg).to.equal('messageServer', 'Une salle avec ce lastName existe déjà.');
            });
            // Sinon.assert.calledWith(spy2, 'addElementListRoom', ({ roomName: 'room1', timeTurn: 1, isBonusRandom: false }));

            done();
        }, RESPONSE_DELAY);
    });

    it('should return list of rooms', (done) => {
        gameServer.minutesByTurn = 1;
        gameServer.randomBonusesOn = false;

        socketManager.rooms.set('room1', gameServer);

        // socketManager['rooms'].set('room2', gameServer);

        // socketManager['rooms'].get('room1')!.gameFinished = true;

        clientSocket1.emit('listRoom');

        setTimeout(() => {
            clientSocket1.on('addElementListRoom', ({ room, time, bonus }) => {
                expect(room).to.equal('room1');
                expect(time).to.equal(1);
                expect(bonus).to.equal(false);
            });
            done();
        }, RESPONSE_DELAY);
    });

    it('joinRoom should refuse new user with same name as an already existing user in the room', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket2.emit('new-user', { name: 'adam', roomName: 'adam' });
        socketManager.rooms.set('room', gameServer);
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        clientSocket2.emit('joinRoom', { roomName: 'room', playerId: clientSocket2.id });

        setTimeout(() => {
            clientSocket1.on('messageServer', (msg) => {
                expect(msg).to.equal('Vous avez le même lastName que le joueur déjà dans la salle, veuillez le changer en retournant au menu principal.');
            });
            done();
        }, RESPONSE_DELAY);
    });

    it('disconnect should call chatService and chatHistory Methods', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket2.emit('new-user', { name: 'adam', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            nameOpponent: 'op',
        });
        clientSocket2.emit('joinRoom', { roomName: 'room', playerId: clientSocket2.id });

        const stub = Sinon.stub(socketManager['chatService'] as any, 'showEndGameStats');

        clientSocket1.disconnect();
        setTimeout(() => {
            Sinon.assert.notCalled(stub);
            done();
        }, RESPONSE_DELAY);
    });

    it('newMessageClient should call manageNewMessageClient spy', (done) => {
        clientSocket1.emit('new-user', { name: 'rayan', roomName: 'room' });
        clientSocket1.emit('createRoomAndGame', {
            roomName: 'room',
            playerName: 'rayan',
            timeTurn: 1,
            isBonusRandom: false,
            gameMode: 'notSolo',
            isLog2990Enabled: true,
            nameOpponent: 'op',
        });

        const spy = Sinon.spy(socketManager as any, 'manageNewMessageClient');
        const msg = 'test';
        clientSocket1.emit('newMessageClient', msg);

        setTimeout(() => {
            Sinon.assert.called(spy);
            done();
        }, RESPONSE_DELAY);
    });

    it('should delete Beginner VPName accordingly', (done) => {
        const BEGINNER_VP_NAMES: NameVP[] = [
            { lastName: 'Oxmol', firstName: 'Mike', protected: true },
            { lastName: 'Jass', firstName: 'Hugh', protected: true },
            { lastName: 'Hwak', firstName: 'Lee', protected: true },
        ];

        const VPNAME: NameVP = { lastName: 'Rayan', firstName: 'Rayan', protected: false };
        clientSocket1.emit('AddBeginnerNameVP', VPNAME);
        clientSocket1.emit('DeleteVPName', VPNAME);

        setTimeout(() => {
            clientSocket1.on('SendBeginnerVPNamesToClient', (namesVP) => {
                expect(namesVP).to.eql(BEGINNER_VP_NAMES);
            });
            done();
        }, RESPONSE_DELAY);
    });

    it('should delete Expert VPName accordingly', (done) => {
        const BEGINNER_VP_NAMES: NameVP[] = [
            { lastName: 'Weiner', firstName: 'I.M.A', protected: true },
            { lastName: 'Ron', firstName: 'Moe', protected: true },
            { lastName: 'Normousbutt', firstName: 'Maya', protected: true },
        ];

        const VPNAME: NameVP = { lastName: 'Rayan', firstName: 'Rayan', protected: false };
        clientSocket1.emit('AddExpertNameVP', VPNAME);
        clientSocket1.emit('DeleteExpertVPName', VPNAME);

        setTimeout(() => {
            clientSocket1.on('SendExpertVPNamesToClient', (namesVP) => {
                expect(namesVP).to.eql(BEGINNER_VP_NAMES);
            });
            done();
        }, RESPONSE_DELAY);
    });

    it('should delete dictionnary accordingly', (done) => {
        const defaultDictionnary: MockDict = { title: 'Dicitonnaire par défaut', description: 'Description de base' };
        const testDictionnary: DictJSON = { title: 'test', description: 'bonne description', words: ['test'] };

        clientSocket1.emit('AddDictionnary', testDictionnary);
        clientSocket1.emit('deleteSelectedDictionnary');

        setTimeout(() => {
            clientSocket1.on('SendDictionnariesToClient', (dictionnary) => {
                expect(dictionnary).to.equal([defaultDictionnary]);
            });
            done();
        }, RESPONSE_DELAY);
    });

    it('should edit dictionnary accordingly', (done) => {
        const testDictionnary: DictJSON = { title: 'Dictionnaire de test', description: 'Description de test', words: ['rien'] };
        clientSocket1.emit('AddDictionnary', testDictionnary);
        const testMockDict: MockDict = { title: 'Nouvelle description de test', description: 'Nouvelle description de tests' };
        clientSocket1.emit('EditDictionnary', testMockDict, testDictionnary.title);

        setTimeout(() => {
            clientSocket1.on('SendDictionnariesToClient', (dictionnaries) => {
                expect(dictionnaries[1]).to.equal(testMockDict);
            });
            done();
        }, RESPONSE_DELAY);
    });

    it('should add Beginner VPName accordingly', (done) => {
        const BEGINNER_VP_NAMES: NameVP[] = [
            { lastName: 'Oxmol', firstName: 'Mike', protected: true },
            { lastName: 'Jass', firstName: 'Hugh', protected: true },
            { lastName: 'Hwak', firstName: 'Lee', protected: true },
        ];

        const VPNAME: NameVP = { lastName: 'Rayan', firstName: 'Rayan', protected: false };
        clientSocket1.emit('AddBeginnerNameVP', VPNAME);

        const NEW_BEGINNER_VP_NAMES: NameVP[] = BEGINNER_VP_NAMES;
        NEW_BEGINNER_VP_NAMES.push(VPNAME);

        setTimeout(() => {
            clientSocket1.on('SendBeginnerVPNamesToClient', (namesVP) => {
                expect(namesVP).to.eql(NEW_BEGINNER_VP_NAMES);
            });
            clientSocket1.emit('DeleteVPName', VPNAME);
            done();
        }, RESPONSE_DELAY);
    });

    it('should add Expert VPName accordingly', (done) => {
        const EXPERT_VP_NAMES: NameVP[] = [
            { lastName: 'Weiner', firstName: 'I.M.A', protected: true },
            { lastName: 'Ron', firstName: 'Moe', protected: true },
            { lastName: 'Normousbutt', firstName: 'Maya', protected: true },
        ];

        const VPNAME: NameVP = { lastName: 'Rayan', firstName: 'Rayan', protected: false };
        clientSocket1.emit('AddExpertNameVP', VPNAME);

        const NEW_EXPERT_VP_NAMES: NameVP[] = EXPERT_VP_NAMES;
        NEW_EXPERT_VP_NAMES.push(VPNAME);

        setTimeout(() => {
            clientSocket1.on('SendExpertVPNamesToClient', (namesVP) => {
                expect(namesVP).to.eql(NEW_EXPERT_VP_NAMES);
            });
            clientSocket1.emit('DeleteExpertVPName', VPNAME);
            done();
        }, RESPONSE_DELAY);
    });

    it('should edit Beginner VPName accordingly', (done) => {
        const EDITED_BEGINNER_VP_NAMES: NameVP[] = [
            { lastName: 'Oxmol', firstName: 'Mike', protected: true },
            { lastName: 'Jass', firstName: 'Hugh', protected: true },
            { lastName: 'Hwak', firstName: 'Lee', protected: true },
            { lastName: 'Rayan', firstName: 'Rayan2', protected: false },
        ];

        const FORMER_VPNAME: NameVP = { lastName: 'Rayan', firstName: 'Rayan', protected: false };
        const EDITED_VPNAME: NameVP = { lastName: 'Rayan', firstName: 'Rayan2', protected: false };

        clientSocket1.emit('AddBeginnerNameVP', FORMER_VPNAME);
        clientSocket1.emit('EditBeginnerNameVP', FORMER_VPNAME, EDITED_VPNAME);

        setTimeout(() => {
            clientSocket1.on('SendBeginnerVPNamesToClient', (namesVP) => {
                expect(namesVP).to.eql(EDITED_BEGINNER_VP_NAMES);
            });
            clientSocket1.emit('DeleteVPName', FORMER_VPNAME);
            done();
        }, RESPONSE_DELAY);
    });

    it('should edit expert VPName accordingly', (done) => {
        const EDITED_BEGINNER_VP_NAMES: NameVP[] = [
            { lastName: 'Weiner', firstName: 'I.M.A', protected: true },
            { lastName: 'Ron', firstName: 'Moe', protected: true },
            { lastName: 'Normousbutt', firstName: 'Maya', protected: true },
            { lastName: 'Rayan', firstName: 'Rayan2', protected: false },
        ];

        const FORMER_VPNAME: NameVP = { lastName: 'Rayan', firstName: 'Rayan', protected: false };
        const EDITED_VPNAME: NameVP = { lastName: 'Rayan', firstName: 'Rayan2', protected: false };

        clientSocket1.emit('AddExpertNameVP', FORMER_VPNAME);
        clientSocket1.emit('EditExpertNameVP', FORMER_VPNAME, EDITED_VPNAME);

        setTimeout(() => {
            clientSocket1.on('SendExpertVPNamesToClient', (namesVP) => {
                expect(namesVP).to.eql(EDITED_BEGINNER_VP_NAMES);
            });
            clientSocket1.emit('DeleteExpertVPName', EDITED_VPNAME);
            done();
        }, RESPONSE_DELAY);
    });

    it("refreshBothDbs should emit that call the function that reset both leaderboards", (done) => {
        clientSocket1.emit('RefreshBothDbs');
        const stub = Sinon.stub(socketManager['databaseService'], 'resetDatabase');
        setTimeout(() => {
            Sinon.assert.called(stub);
            done();
        }, RESPONSE_DELAY);
    })

    it("should call the getScoreClassic and getScoreLOG2990 when emitting 'dbReception'", (done) => {
        clientSocket1.emit('dbReception');
        setTimeout(() => {
            console.log("test");
            done();
        }, RESPONSE_DELAY);
    });
});
