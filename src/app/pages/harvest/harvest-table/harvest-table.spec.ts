import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HarvestTable } from './harvest-table';

describe('HarvestTable', () => {
  let component: HarvestTable;
  let fixture: ComponentFixture<HarvestTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HarvestTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HarvestTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
