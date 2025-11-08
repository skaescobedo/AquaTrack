import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PondDashboard } from './pond-dashboard';

describe('PondDashboard', () => {
  let component: PondDashboard;
  let fixture: ComponentFixture<PondDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PondDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PondDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
