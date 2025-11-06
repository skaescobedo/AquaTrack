import { TestBed } from '@angular/core/testing';

import { Ponds } from './ponds';

describe('Ponds', () => {
  let service: Ponds;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ponds);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
