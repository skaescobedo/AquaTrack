import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Biometry } from './biometry';

describe('Biometry', () => {
  let component: Biometry;
  let fixture: ComponentFixture<Biometry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Biometry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Biometry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
