import { TestBed } from '@angular/core/testing';

import { AutosaveStateService } from './autosave-state.service';
import { StorageService } from '../BrowserStorage/storage.service';
import { MockProvider } from 'ng-mocks';

describe('AutosaveStateService', () => {
  let service: AutosaveStateService;

  let setItemSpy: jasmine.Spy;
  let getItemSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(StorageService, {
          getAutosaveEnabled() {
            return false;
          },
        }),
      ],
    });

    service = TestBed.inject(AutosaveStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize disabled', () => {
    expect(service.getAutosaveState()).toBeFalse();
    service
      .getAutosaveStateAsObservable()
      .subscribe((value) => expect(value).toBeFalse());
  });

  it('should set state', () => {
    service.setAutosaveState(true);

    expect(service.getAutosaveState()).toBeTrue();
    service
      .getAutosaveStateAsObservable()
      .subscribe((value) => expect(value).toBeTrue());
  });
});
