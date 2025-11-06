import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiometryWizard } from './biometry-wizard';

describe('BiometryWizard', () => {
  let component: BiometryWizard;
  let fixture: ComponentFixture<BiometryWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiometryWizard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiometryWizard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
