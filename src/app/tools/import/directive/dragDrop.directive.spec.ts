import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MockService } from 'ng-mocks';

import { DragDirective } from './dragDrop.directive';
import { ImportDomainStoryService } from '../services/import-domain-story.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';

describe('DragDirective', () => {
  let directive: DragDirective;
  let importServiceSpy: jest.Mocked<ImportDomainStoryService>;
  let snackbarSpy: jest.Mocked<MatSnackBar>;
  let dirtySignal: ReturnType<typeof signal<boolean>>;

  function dragEvent(files?: File[]): DragEvent {
    return {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      dataTransfer: files ? { files } : undefined,
    } as unknown as DragEvent;
  }

  beforeEach(() => {
    dirtySignal = signal(false);

    TestBed.configureTestingModule({
      providers: [
        DragDirective,
        {
          provide: ImportDomainStoryService,
          useValue: MockService(ImportDomainStoryService),
        },
        {
          provide: MatSnackBar,
          useValue: MockService(MatSnackBar),
        },
        {
          provide: DirtyFlagService,
          useValue: { dirty: dirtySignal.asReadonly() },
        },
      ],
    });

    directive = TestBed.inject(DragDirective);
    importServiceSpy = TestBed.inject(
      ImportDomainStoryService,
    ) as jest.Mocked<ImportDomainStoryService>;
    snackbarSpy = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
  });

  it('should be created', () => {
    expect(directive).toBeTruthy();
  });

  it('highlights the background on drag over and clears it on drag leave', () => {
    const overEvent = dragEvent();
    directive.onDragOver(overEvent);
    expect(directive.background).toBe('#999');
    expect(overEvent.preventDefault).toHaveBeenCalled();
    expect(overEvent.stopPropagation).toHaveBeenCalled();

    const leaveEvent = dragEvent();
    directive.onDragLeave(leaveEvent);
    expect(directive.background).toBe('');
    expect(leaveEvent.preventDefault).toHaveBeenCalled();
    expect(leaveEvent.stopPropagation).toHaveBeenCalled();
  });

  it('imports a dropped file directly when not dirty', () => {
    const file = new File(['{}'], 'story.egn');

    directive.onDrop(dragEvent([file]));

    expect(directive.background).toBe('');
    expect(importServiceSpy.performDropImport).toHaveBeenCalledWith(file);
    expect(
      importServiceSpy.openUnsavedChangesReminderDialog,
    ).not.toHaveBeenCalled();
  });

  it('asks for confirmation before importing when dirty', () => {
    dirtySignal.set(true);
    const file = new File(['{}'], 'story.egn');

    directive.onDrop(dragEvent([file]));

    expect(
      importServiceSpy.openUnsavedChangesReminderDialog,
    ).toHaveBeenCalledTimes(1);
    expect(importServiceSpy.performDropImport).not.toHaveBeenCalled();

    // invoking the confirmation callback performs the import
    const confirmCallback =
      importServiceSpy.openUnsavedChangesReminderDialog.mock.calls[0][0];
    confirmCallback();
    expect(importServiceSpy.performDropImport).toHaveBeenCalledWith(file);
  });

  it('shows an error when there is nothing to import', () => {
    directive.onDrop(dragEvent());

    expect(importServiceSpy.performDropImport).not.toHaveBeenCalled();
    expect(snackbarSpy.open).toHaveBeenCalledWith(
      'Nothing to import',
      undefined,
      expect.anything(),
    );
  });
});
