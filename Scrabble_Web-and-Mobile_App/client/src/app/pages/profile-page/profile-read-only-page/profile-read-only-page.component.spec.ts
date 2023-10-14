/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfileReadOnlyPageComponent } from './profile-read-only-page.component';

describe('ProfileReadOnlyPageComponent', () => {
    let component: ProfileReadOnlyPageComponent;
    let fixture: ComponentFixture<ProfileReadOnlyPageComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ProfileReadOnlyPageComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfileReadOnlyPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
