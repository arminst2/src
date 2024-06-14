import { TestBed } from '@angular/core/testing';

import { OtpremnicaService } from './otpremnica.service';

describe('OtpremnicaService', () => {
  let service: OtpremnicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpremnicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
