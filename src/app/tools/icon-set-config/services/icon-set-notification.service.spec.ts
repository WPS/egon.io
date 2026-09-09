import { TestBed } from '@angular/core/testing';
import { MockProviders } from 'ng-mocks';
import { MatSnackBar } from '@angular/material/snack-bar';

import { IconSetNotificationService } from 'src/app/tools/icon-set-config/services/icon-set-notification.service';
import {
  SNACKBAR_DURATION,
  SNACKBAR_DURATION_LONGER,
  SNACKBAR_ERROR,
  SNACKBAR_INFO,
  SNACKBAR_SUCCESS,
} from 'src/app/domain/entities/constants';

describe('IconSetNotificationService', () => {
  let service: IconSetNotificationService;
  let snackbarSpy: jest.Mocked<MatSnackBar>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProviders(MatSnackBar)],
    });
    snackbarSpy = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
    service = TestBed.inject(IconSetNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openConfigurationImportOrSavedSnackbar', () => {
    it('should show the imported message when imported is true', () => {
      service.openConfigurationImportOrSavedSnackbar(true);

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'Configuration imported successfully',
        undefined,
        { duration: SNACKBAR_DURATION, panelClass: SNACKBAR_SUCCESS },
      );
    });

    it('should show the saved message when imported is false', () => {
      service.openConfigurationImportOrSavedSnackbar(false);

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'Configuration saved successfully',
        undefined,
        { duration: SNACKBAR_DURATION, panelClass: SNACKBAR_SUCCESS },
      );
    });
  });

  describe('openAlreadyUsedIconsSnackbar', () => {
    it('should list only actors when only actors changed', () => {
      service.openAlreadyUsedIconsSnackbar(['Person', 'Group'], []);

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'The following icons are already in use as actors and cannot be changed: Person, Group',
        undefined,
        { duration: SNACKBAR_DURATION_LONGER, panelClass: SNACKBAR_ERROR },
      );
    });

    it('should list only work objects when only work objects changed', () => {
      service.openAlreadyUsedIconsSnackbar([], ['Document', 'Folder']);

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'The following icons are already in use as work objects and cannot be changed: Document, Folder',
        undefined,
        { duration: SNACKBAR_DURATION_LONGER, panelClass: SNACKBAR_ERROR },
      );
    });

    it('should list both actors and work objects when both changed', () => {
      service.openAlreadyUsedIconsSnackbar(['Person'], ['Document']);

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'The following icons are already in use as actors and cannot be changed: Person & ' +
          'the following icons are already in use as work objects and cannot be changed: Document',
        undefined,
        { duration: SNACKBAR_DURATION_LONGER, panelClass: SNACKBAR_ERROR },
      );
    });
  });

  describe('openNoImportOrNoSaveSnackbar', () => {
    it('should show the no-import message when imported is true', () => {
      service.openNoImportOrNoSaveSnackbar(true);

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'No configuration to be imported',
        undefined,
        { duration: SNACKBAR_DURATION, panelClass: SNACKBAR_INFO },
      );
    });

    it('should show the no-save message when imported is false', () => {
      service.openNoImportOrNoSaveSnackbar(false);

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'No configuration to be saved',
        undefined,
        { duration: SNACKBAR_DURATION, panelClass: SNACKBAR_INFO },
      );
    });
  });
});
