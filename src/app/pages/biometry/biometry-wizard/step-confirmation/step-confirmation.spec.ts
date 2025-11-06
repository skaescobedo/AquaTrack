import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepConfirmation } from './step-confirmation';

describe('StepConfirmation', () => {
  let component: StepConfirmation;
  let fixture: ComponentFixture<StepConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
