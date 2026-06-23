import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesDialogComponent } from 'src/app/tools/properties/presentation/properties-dialog/properties-dialog.component';
import { MockModule, MockProviders, MockService } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { DirtyFlagService } from 'src/app/domain/services/dirty-flag.service';
import {
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
} from 'src/app/domain/entities/constants';

describe('HeaderDialogComponent', () => {
  let component: PropertiesDialogComponent;
  let fixture: ComponentFixture<PropertiesDialogComponent>;

  let propertiesService: PropertiesService;
  let dirtyFlagService: DirtyFlagService;
  let dialogRef: MatDialogRef<PropertiesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PropertiesDialogComponent,
        MockModule(MatDialogModule),
        MockModule(MatFormFieldModule),
        MockModule(MatInputModule),
        MockModule(MatButtonModule),
        MockModule(ReactiveFormsModule),
      ],
      providers: [
        {
          provide: PropertiesService,
          useValue: MockService(PropertiesService),
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
    fixture = TestBed.createComponent(PropertiesDialogComponent);
    component = fixture.componentInstance;
    propertiesService = TestBed.inject(PropertiesService);
    dirtyFlagService = TestBed.inject(DirtyFlagService);
    dialogRef = TestBed.inject(MatDialogRef);

    spyOn(propertiesService, 'updateTitleAndDescriptionAndScope');
    spyOn(dirtyFlagService, 'makeDirty');
    spyOn(propertiesService, 'getTitle').and.returnValue(INITIAL_TITLE);
    spyOn(propertiesService, 'getDescription').and.returnValue(
      INITIAL_DESCRIPTION,
    );
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
      expect(
        propertiesService.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalled();
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
      expect(
        propertiesService.updateTitleAndDescriptionAndScope,
      ).not.toHaveBeenCalled();
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
