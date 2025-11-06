import { TestBed } from '@angular/core/testing';

import { Projections } from './projections';

describe('Projections', () => {
  let service: Projections;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Projections);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
