import {TestBed} from '@angular/core/testing';

import {DirtyFlagService} from 'src/app/Service/DirtyFlag/dirty-flag.service';

describe('DirtyFlagService', () => {
  let service: DirtyFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirtyFlagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
