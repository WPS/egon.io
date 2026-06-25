import { TestBed } from '@angular/core/testing';

import { DirtyFlagService } from 'src/app/domain/services/dirty-flag.service';

describe('DirtyFlagService', () => {
  let service: DirtyFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirtyFlagService);
  });

  it('should initialize as clean', () => {
    expect(service.dirty()).toBeFalse();
  });

  it('should set dirty flag to true when makeDirty() is called', () => {
    service.makeDirty();
    expect(service.dirty()).toBeTrue();
  });

  it('should reset the dirty flag to false when makeClean() is called', () => {
    service.makeDirty();
    expect(service.dirty()).toBeTrue();

    service.makeClean();
    expect(service.dirty()).toBeFalse();
  });
});
