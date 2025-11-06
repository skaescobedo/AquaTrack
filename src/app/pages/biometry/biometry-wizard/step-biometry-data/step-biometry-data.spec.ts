import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepBiometryData } from './step-biometry-data';

describe('StepBiometryData', () => {
  let component: StepBiometryData;
  let fixture: ComponentFixture<StepBiometryData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepBiometryData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepBiometryData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
