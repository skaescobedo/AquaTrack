import { TestBed } from '@angular/core/testing';

import { Harvest } from './harvest';

describe('Harvest', () => {
  let service: Harvest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Harvest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
