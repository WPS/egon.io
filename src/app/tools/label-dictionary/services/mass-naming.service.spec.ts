import { TestBed } from '@angular/core/testing';

import { MassNamingService } from 'src/app/tools/label-dictionary/services/mass-naming.service';

describe('MassNamingService', () => {
  let service: MassNamingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MassNamingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
