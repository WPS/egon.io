import { TestBed } from '@angular/core/testing';

import { ImportRepairService } from 'src/app/Service/Import/import-repair.service';
import { ElementRegistryService } from '../ElementRegistry/element-registry.service';

describe('ImportRepairService', () => {
  let service: ImportRepairService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ElementRegistryService] });
    service = TestBed.inject(ImportRepairService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
