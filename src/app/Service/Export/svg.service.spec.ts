import {TestBed} from '@angular/core/testing';

import {SvgService} from 'src/app/Service/Export/svg.service';
import {ModelerService} from '../Modeler/modeler.service';
import {MockService} from 'ng-mocks';

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
