import { TestBed } from '@angular/core/testing';

import { ActivityClickHandlerService } from 'src/app/tools/activity/services/activity-click-handler.service';

describe('ActivityClickHandlerService', () => {
  let service: ActivityClickHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityClickHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
