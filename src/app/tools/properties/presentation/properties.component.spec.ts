import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesComponent } from 'src/app/tools/properties/presentation/properties.component';
import { MockModule, MockService } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import {
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
} from 'src/app/domain/entities/constants';
import { MatSelectModule } from '@angular/material/select';
import {
  DomainPurity,
  Granularity_Goal,
  Granularity_Grain,
  PointInTime,
  Scope,
} from 'src/app/domain/entities/scope';

describe('PropertiesComponent', () => {
  let component: PropertiesComponent;
  let fixture: ComponentFixture<PropertiesComponent>;

  let propertiesService: PropertiesService;
  let dirtyFlagService: DirtyFlagService;

  let getScopeSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PropertiesComponent,
        MockModule(MatFormFieldModule),
        MockModule(MatInputModule),
        MockModule(MatButtonModule),
        MockModule(ReactiveFormsModule),
        MockModule(MatSelectModule),
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
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesComponent);
    component = fixture.componentInstance;
    propertiesService = TestBed.inject(PropertiesService);
    dirtyFlagService = TestBed.inject(DirtyFlagService);

    spyOn(propertiesService, 'updateTitleAndDescriptionAndScope');
    spyOn(dirtyFlagService, 'makeDirty');
    spyOn(propertiesService, 'getTitle').and.returnValue(INITIAL_TITLE);
    spyOn(propertiesService, 'getDescription').and.returnValue(
      INITIAL_DESCRIPTION,
    );
    getScopeSpy = spyOn(propertiesService, 'getScope').and.returnValue(
      undefined,
    );

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component with correct form', () => {
    expect(component.form.getRawValue().title).toBe('<title>');
    expect(component.form.getRawValue().description).toBe('');
    expect(component.form.getRawValue().pointInTime).toBe(null);
    expect(component.form.getRawValue().domainPurity).toBe(null);
    expect(component.form.getRawValue().granularity).toBe(null);
    expect(component.form.dirty).toBe(false);
  });

  describe('ngOnInit', () => {
    it('should initialize the form with the values from the service', () => {
      (propertiesService.getTitle as jasmine.Spy).and.returnValue('My Title');
      (propertiesService.getDescription as jasmine.Spy).and.returnValue(
        'My Description',
      );

      component.ngOnInit();

      expect(component.form.getRawValue().title).toBe('My Title');
      expect(component.form.getRawValue().description).toBe('My Description');
    });

    it('should initialize the scope values from the service', () => {
      const scope: Scope = {
        granularity: Granularity_Grain.FINE,
        pointInTime: PointInTime.TO_BE,
        domainPurity: DomainPurity.PURE,
      };
      getScopeSpy.and.returnValue(scope);

      component.ngOnInit();

      expect(component.form.getRawValue().granularity).toBe(
        Granularity_Grain.FINE,
      );
      expect(component.form.getRawValue().pointInTime).toBe(PointInTime.TO_BE);
      expect(component.form.getRawValue().domainPurity).toBe(DomainPurity.PURE);
    });

    it('should set null scope values when scope is undefined', () => {
      getScopeSpy.and.returnValue(undefined);

      component.ngOnInit();

      expect(component.form.getRawValue().granularity).toBeNull();
      expect(component.form.getRawValue().pointInTime).toBeNull();
      expect(component.form.getRawValue().domainPurity).toBeNull();
    });

    it('should save whenever the form value changes', () => {
      const saveSpy = spyOn(component, 'save');

      component.form.controls.title.setValue('changed');

      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('should do nothing when the form is not dirty', () => {
      component.form.markAsPristine();

      component.save();

      expect(dirtyFlagService.makeDirty).not.toHaveBeenCalled();
      expect(
        propertiesService.updateTitleAndDescriptionAndScope,
      ).not.toHaveBeenCalled();
    });

    it('should mark the application as dirty when the form is dirty', () => {
      component.form.markAsDirty();

      component.save();

      expect(dirtyFlagService.makeDirty).toHaveBeenCalled();
    });

    it('should pass title, description and scope to the service', () => {
      component.form.setValue({
        title: 'New Title',
        description: 'New Description',
        granularity: Granularity_Goal.KITE,
        pointInTime: PointInTime.AS_IS,
        domainPurity: DomainPurity.DIGITALIZED,
      });
      component.form.markAsDirty();

      component.save();

      expect(
        propertiesService.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(
        'New Title',
        'New Description',
        {
          granularity: Granularity_Goal.KITE,
          pointInTime: PointInTime.AS_IS,
          domainPurity: DomainPurity.DIGITALIZED,
        },
        true,
      );
    });

    it('should map empty scope values to undefined', () => {
      component.form.setValue({
        title: 'New Title',
        description: 'New Description',
        granularity: null,
        pointInTime: null,
        domainPurity: null,
      });
      component.form.markAsDirty();

      component.save();

      expect(
        propertiesService.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(
        'New Title',
        'New Description',
        {
          granularity: undefined,
          pointInTime: undefined,
          domainPurity: undefined,
        },
        true,
      );
    });
  });

  describe('preventDefault', () => {
    it('should prevent the default event behavior', () => {
      const event = jasmine.createSpyObj<Event>('Event', ['preventDefault']);

      component.preventDefault(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('select option values', () => {
    it('should expose the granularity grain values', () => {
      expect(component.GranularityGrainValues.map((v) => v.value)).toEqual([
        Granularity_Grain.COARSE,
        Granularity_Grain.MEDIUM,
        Granularity_Grain.FINE,
      ]);
    });

    it('should expose the granularity goal values', () => {
      expect(component.GranularityGoalValues.map((v) => v.value)).toEqual([
        Granularity_Goal.CLOUD,
        Granularity_Goal.KITE,
        Granularity_Goal.SEA,
        Granularity_Goal.FISH,
        Granularity_Goal.CLAM,
      ]);
    });

    it('should expose the point in time values', () => {
      expect(component.PointInTimeValues.map((v) => v.value)).toEqual([
        PointInTime.TO_BE,
        PointInTime.AS_IS,
      ]);
    });

    it('should expose the domain purity values', () => {
      expect(component.DomainPurityValues.map((v) => v.value)).toEqual([
        DomainPurity.PURE,
        DomainPurity.DIGITALIZED,
      ]);
    });
  });
});
