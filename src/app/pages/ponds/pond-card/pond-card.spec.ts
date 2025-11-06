import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PondCard } from './pond-card';

describe('PondCard', () => {
  let component: PondCard;
  let fixture: ComponentFixture<PondCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PondCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PondCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
