import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleHistoryCard } from './cycle-history-card';

describe('CycleHistoryCard', () => {
  let component: CycleHistoryCard;
  let fixture: ComponentFixture<CycleHistoryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CycleHistoryCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CycleHistoryCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
