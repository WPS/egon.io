import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleDialogComponent } from 'src/app/tools/title/presentation/title-dialog/title-dialog.component';
import { MockModule, MockProviders, MockService } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TitleService } from '../../services/title.service';
import { DirtyFlagService } from '../../../../domain/services/dirty-flag.service';
import {
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
} from '../../../../domain/entities/constants';

describe('HeaderDialogComponent', () => {
  let component: TitleDialogComponent;
  let fixture: ComponentFixture<TitleDialogComponent>;

  let titleService: TitleService;
  let dirtyFlagService: DirtyFlagService;
  let dialogRef: MatDialogRef<TitleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TitleDialogComponent],
      imports: [MockModule(MaterialModule), MockModule(ReactiveFormsModule)],
      providers: [
        {
          provide: TitleService,
          useValue: MockService(TitleService),
        },
        {
          provide: DirtyFlagService,
          useValue: MockService(DirtyFlagService),
        },
        {
          provide: MatDialogRef,
          useValue: MockService(MatDialogRef),
        },
        MockProviders(MatDialog),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleDialogComponent);
    component = fixture.componentInstance;
    titleService = TestBed.inject(TitleService);
    dirtyFlagService = TestBed.inject(DirtyFlagService);
    dialogRef = TestBed.inject(MatDialogRef);

    spyOn(titleService, 'updateTitleAndDescription');
    spyOn(dirtyFlagService, 'makeDirty');
    spyOn(titleService, 'getTitle').and.returnValue(INITIAL_TITLE);
    spyOn(titleService, 'getDescription').and.returnValue(INITIAL_DESCRIPTION);
    spyOn(dialogRef, 'close');

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should initialize component with correct form', () => {
    expect(component.form.getRawValue().title).toBe('<title>');
    expect(component.form.getRawValue().description).toBe('');
    expect(component.form.dirty).toBe(false);
  });

  describe('apply save with form marks as DIRTY', () => {
    beforeEach(() => {
      component.form.markAsDirty();
      component.save();
    });

    it('should call updateTitleAndDescription', () => {
      expect(titleService.updateTitleAndDescription).toHaveBeenCalled();
    });

    it('should call markDirty', () => {
      expect(dirtyFlagService.makeDirty).toHaveBeenCalled();
    });

    it('should close the dialog', () => {
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  describe('apply save with form NOT TO BE marks as DIRTY', () => {
    beforeEach(() => {
      component.save();
    });

    it('should NOT call updateTitleAndDescription', () => {
      expect(titleService.updateTitleAndDescription).not.toHaveBeenCalled();
    });
    it('should NOT call markDirty', () => {
      expect(dirtyFlagService.makeDirty).not.toHaveBeenCalled();
    });
    //
    it('should close the dialog', () => {
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  it('apply close, should close the dialog', () => {
    component.close();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');

    component.preventDefault(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });
});
