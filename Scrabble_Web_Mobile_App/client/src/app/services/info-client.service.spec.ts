/* eslint-disable */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NameVP } from '@app/classes/names-vp';
import { InfoClientService } from './info-client.service';

describe('InfoClientService', () => {
    let service: InfoClientService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        service = TestBed.inject(InfoClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('giveRandomNbOpponent should return numbers between 0 and 2 included', () => {
        for (let i = 0; i < 100; i++) {
            expect(service['giveRandomNbOpponent']()).toBeGreaterThanOrEqual(0);
            expect(service['giveRandomNbOpponent']()).toBeLessThan(3);
        }
    });

    it('generateNameOpponent should change the player name if the name is taken', () => {
        const giveRandomNbOpponentSpy = spyOn<any>(service, 'giveRandomNbOpponent').and.returnValue(2);
        service.nameVPBeginner[0] = new NameVP();
        service.nameVPBeginner[1] = new NameVP();
        service.nameVPBeginner[2] = new NameVP();
        service.nameVPBeginner[2].firstName = "Hugh";
        service.nameVPBeginner[2].lastName = "Jass";

        service.generateNameOpponent('HughJass');
        expect(giveRandomNbOpponentSpy).toHaveBeenCalled();
    });


    it('generateNameOpponent should change the player name if the name is taken', () => {
        const giveRandomNbOpponentSpy = spyOn<any>(service, 'giveRandomNbOpponent').and.returnValue(1);
        service.nameVPBeginner[0] = new NameVP();
        service.nameVPBeginner[1] = new NameVP();
        service.nameVPBeginner[2] = new NameVP();

        service.nameVPBeginner[1].firstName = "Hugh";
        service.nameVPBeginner[1].lastName = "Jass";
        service.nameVPBeginner[2].firstName = "Damm";
        service.nameVPBeginner[2].lastName = "2";

        service.generateNameOpponent('HughJass');
        expect(giveRandomNbOpponentSpy).toHaveBeenCalled();
    });

    it('generateNameOpponent should change the player name if the name is taken', () => {
        const giveRandomNbOpponentSpy = spyOn<any>(service, 'giveRandomNbOpponent').and.returnValue(2);
        service.nameVPExpert[0] = new NameVP();
        service.nameVPExpert[1] = new NameVP();
        service.nameVPExpert[2] = new NameVP();
        service.nameVPExpert[2].firstName = "Hugh";
        service.nameVPExpert[2].lastName = "Jass";
        service.vpLevel = 'expert';

        service.generateNameOpponent('HughJass');
        expect(giveRandomNbOpponentSpy).toHaveBeenCalled();
    });


    it('generateNameOpponent should change the player name if the name is taken', () => {
        const giveRandomNbOpponentSpy = spyOn<any>(service, 'giveRandomNbOpponent').and.returnValue(1);
        service.nameVPExpert[0] = new NameVP();
        service.nameVPExpert[1] = new NameVP();
        service.nameVPExpert[2] = new NameVP();

        service.nameVPExpert[1].firstName = "Hugh";
        service.nameVPExpert[1].lastName = "Jass";
        service.nameVPExpert[2].firstName = "Damm";
        service.nameVPExpert[2].lastName = "2";
        service.vpLevel = 'expert';

        service.generateNameOpponent('HughJass');
        expect(giveRandomNbOpponentSpy).toHaveBeenCalled();
    });
});
