import { TestBed } from '@angular/core/testing';

import { ImportRepairService } from 'src/app/tools/import/services/import-repair.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';

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
