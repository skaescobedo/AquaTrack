import { TestBed } from '@angular/core/testing';

import { Cycles } from './cycles';

describe('Cycles', () => {
  let service: Cycles;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cycles);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
