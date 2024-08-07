import { TestBed } from '@angular/core/testing';

import {ReplayService} from "./replay.service";

describe(ReplayService.name, () => {
  let service: ReplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return value', () => {
    expect(service.getReplayOn()).toBeFalse();
  });

  it('should return Observable', () => {
    service.replayOn$.subscribe((value) => expect(value).toBeFalse());
  });

  it('should set value', () => {
    service.setReplayState(true);
    expect(service.getReplayOn()).toBeTrue();
  });
});
