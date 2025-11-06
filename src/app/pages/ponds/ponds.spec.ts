import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ponds } from './ponds';

describe('Ponds', () => {
  let component: Ponds;
  let fixture: ComponentFixture<Ponds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ponds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ponds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
