import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedingTable } from './seeding-table';

describe('SeedingTable', () => {
  let component: SeedingTable;
  let fixture: ComponentFixture<SeedingTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeedingTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeedingTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
