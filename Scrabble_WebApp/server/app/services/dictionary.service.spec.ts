/* eslint-disable */
// import { expect } from 'chai';
// // import { createStubInstance, SinonStubbedInstance } from 'sinon';
// import { DictionaryService } from './dictionary.service';

// describe('DictionaryService', () => {
//     let service: DictionaryService;
//     // let collectionsStub: SinonStubbedInstance<Collections>;
//     beforeEach(async () => {
//         // collectionsStub = createStubInstance(Collections);
//         service = new DictionaryService();
//     });

//     it('should be created', (done) => {
//         expect(service).to.equal(service);
//         done();
//     });

//     // type assertion pas encore bien faite, lire doc
//     it('should return lexicon', (done) => {
//         service.createLexicon();
//         expect(service.getTrie()).to.be.an('object');
//         done();
//     });

//     it('should add word to trie data structure', (done) => {
//         expect(service.containsWord('aa')).to.equal(true);
//         done();
//     });

//     it('should not recognize word not added to trie data structure', (done) => {
//         service.createLexicon();
//         expect(service.isPrefix('c')).to.equal(true);
//         expect(service.isPrefix('ce')).to.equal(true);
//         expect(service.containsWord('cer')).to.equal(false);
//         expect(service.isPrefix('cer')).to.equal(true);
//         expect(service.containsWord('cerf')).to.equal(true);
//         expect(service.isPrefix('cerf')).to.equal(true);
//         done();
//     });
// });
