import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Seeding } from './seeding';

describe('Seeding', () => {
  let component: Seeding;
  let fixture: ComponentFixture<Seeding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Seeding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Seeding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
