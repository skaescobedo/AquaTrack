import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepFarmAssignment } from './step-farm-assignment';

describe('StepFarmAssignment', () => {
  let component: StepFarmAssignment;
  let fixture: ComponentFixture<StepFarmAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepFarmAssignment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepFarmAssignment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
