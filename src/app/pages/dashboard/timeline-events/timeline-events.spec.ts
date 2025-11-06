import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineEvents } from './timeline-events';

describe('TimelineEvents', () => {
  let component: TimelineEvents;
  let fixture: ComponentFixture<TimelineEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
