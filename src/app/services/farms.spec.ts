import { TestBed } from '@angular/core/testing';

import { Farms } from './farms';

describe('Farms', () => {
  let service: Farms;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Farms);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
