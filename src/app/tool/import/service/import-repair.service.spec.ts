import { TestBed } from '@angular/core/testing';

import { ImportRepairService } from 'src/app/tool/import/service/import-repair.service';
import { ElementRegistryService } from '../../../domain/service/element-registry.service';

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
