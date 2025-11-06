import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepSelectPond } from './step-select-pond';

describe('StepSelectPond', () => {
  let component: StepSelectPond;
  let fixture: ComponentFixture<StepSelectPond>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepSelectPond]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepSelectPond);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
