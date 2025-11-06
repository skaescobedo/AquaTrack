import { TestBed } from '@angular/core/testing';

import { Biometry } from './biometry';

describe('Biometry', () => {
  let service: Biometry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Biometry);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
