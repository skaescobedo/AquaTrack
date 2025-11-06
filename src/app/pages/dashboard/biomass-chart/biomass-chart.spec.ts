import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiomassChart } from './biomass-chart';

describe('BiomassChart', () => {
  let component: BiomassChart;
  let fixture: ComponentFixture<BiomassChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiomassChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiomassChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
