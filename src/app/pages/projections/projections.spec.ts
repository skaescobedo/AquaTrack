import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Projections } from './projections';

describe('Projections', () => {
  let component: Projections;
  let fixture: ComponentFixture<Projections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projections]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Projections);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
