import { TestBed } from '@angular/core/testing';

import { IconSetNotificationService } from 'src/app/tools/icon-set-config/services/icon-set-notification.service';

describe('IconSetNotificationService', () => {
  let service: IconSetNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconSetNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
