import { TestBed } from '@angular/core/testing';

import { Seeding } from './seeding';

describe('Seeding', () => {
  let service: Seeding;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Seeding);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
