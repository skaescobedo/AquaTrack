import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmModal } from './farm-modal';

describe('FarmModal', () => {
  let component: FarmModal;
  let fixture: ComponentFixture<FarmModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
