import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowthChart } from './growth-chart';

describe('GrowthChart', () => {
  let component: GrowthChart;
  let fixture: ComponentFixture<GrowthChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrowthChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrowthChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
