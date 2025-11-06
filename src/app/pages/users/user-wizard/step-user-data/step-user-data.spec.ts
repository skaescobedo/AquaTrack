import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepUserData } from './step-user-data';

describe('StepUserData', () => {
  let component: StepUserData;
  let fixture: ComponentFixture<StepUserData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepUserData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepUserData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
