import { TestBed } from '@angular/core/testing';

import { SvgService } from 'src/app/export/service/svg.service';
import { ModelerService } from '../../modeler/service/modeler.service';
import { MockService } from 'ng-mocks';

describe('SvgService', () => {
  let service: SvgService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModelerService,
          useValue: MockService(ModelerService),
        },
      ],
    });
    service = TestBed.inject(SvgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
