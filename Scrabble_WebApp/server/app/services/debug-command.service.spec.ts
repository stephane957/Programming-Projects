// /* eslint-disable */
// import { Move } from '@app/classes/move';
// import { Player } from '@app/classes/player';
// import { expect } from 'chai';
// import { describe, it } from 'mocha';
// // import { ChatService } from './chat.service';
// import { DebugCommandService } from './debug-command.service';
// // import sinon = require('sinon');

// describe('Service: DebugCommand', () => {
//     let service: DebugCommandService;
//     // let chatService: ChatService;
//     let player: Player;

//     beforeEach(() => {
//         // chatService = TestBed.inject(ChatService);
//         service = new DebugCommandService();
//         player = new Player('Test');
//     });

//     it('extractCoordinates should return coordinates3', (done) => {
//         expect(service['extractCoordinates']('g2h')).equal('G2');
//         expect(service['extractCoordinates']('f9v')).equal('F9');
//         done();
//     });

//     it('extractCoordinates should return coordinates4', (done) => {
//         expect(service['extractCoordinates']('g12h')).equal('G12');
//         expect(service['extractCoordinates']('f15v')).equal('F15');
//         done();
//     });

//     it('extractCoordinates should return empty string if parameter position is invalid', (done) => {
//         expect(service['extractCoordinates']('g2hsx')).equal('');
//         expect(service['extractCoordinates']('8/f9v')).equal('');
//         done();
//     });

//     it('printByLetter vertical case', (done) => {
//         const score = 10;
//         const moveToPlay = new Move(score, 'h8v', ['hfkop'], 'word');
//         expect(service['printByLetter']('H8', moveToPlay, 'v')).equal('H8:w  I8:o  J8:r  K8:d  ');
//         done();
//     });

//     it('printByLetter horizontal case', (done) => {
//         const score = 10;
//         const moveToPlay = new Move(score, 'h8h', ['hfkop'], 'word');
//         expect(service['printByLetter']('H8', moveToPlay, 'h')).equal('H8:w  H9:o  H10:r  H11:d  ');
//         done();
//     });

//     it('debugPrint should return null if the !debug command is off or if no move has been found', () => {
//         player.debugOn = false;
//         const moveToPlay = undefined;
//         expect(service.debugPrint(player, moveToPlay)).to.be.equal(null);
//     });

//     it('debugPrint should return undefined if no move has been found by the virtual player', () => {
//         player.debugOn = true;
//         const moveToPlay = undefined;
//         expect(service.debugPrint(player, moveToPlay)).to.be.equal(undefined);
//     });

//     it('debugPrint should return if the move is defined and the debug command is on', () => {
//         player.debugOn = true;
//         const score = 10;
//         const moveToPlay = new Move(score, 'h8h', ['hfkop'], 'word');
//         expect(service.debugPrint(player, moveToPlay)).to.not.be.equal(null);
//     });
// });
