import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiometryTable } from './biometry-table';

describe('BiometryTable', () => {
  let component: BiometryTable;
  let fixture: ComponentFixture<BiometryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiometryTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiometryTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
