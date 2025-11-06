import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWizard } from './user-wizard';

describe('UserWizard', () => {
  let component: UserWizard;
  let fixture: ComponentFixture<UserWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserWizard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserWizard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
