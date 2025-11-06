import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PondModal } from './pond-modal';

describe('PondModal', () => {
  let component: PondModal;
  let fixture: ComponentFixture<PondModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PondModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PondModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
