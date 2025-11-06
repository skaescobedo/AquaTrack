import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleDashboard } from './cycle-dashboard';

describe('CycleDashboard', () => {
  let component: CycleDashboard;
  let fixture: ComponentFixture<CycleDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CycleDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CycleDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
