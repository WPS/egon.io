import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSetConfigurationComponent } from 'src/app/tools/icon-set-config/presentation/icon-set-configuration/icon-set-configuration.component';
import { MockProvider } from 'ng-mocks';
import { IconSetImportExportService } from '../../services/icon-set-import-export.service';
import { IconDictionaryService } from '../../services/icon-dictionary.service';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { IconSetComponent } from '../icon-set/icon-set.component';
import { Dictionary } from '../../../../domain/entities/dictionary';
import { signal } from '@angular/core';

describe(IconSetConfigurationComponent.name, () => {
  let component: IconSetConfigurationComponent;
  let fixture: ComponentFixture<IconSetConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSetConfigurationComponent, IconSetComponent],
      providers: [
        {
          provide: IconSetImportExportService,
          useValue: jasmine.createSpyObj('IconSetImportExportService', [], {
            iconSetName: signal('testIconSetName'),
          }),
        },
        MockProvider(IconDictionaryService, {
          getFullDictionary(): Dictionary {
            return new Dictionary();
          },
        }),
        {
          provide: IconSetCustomizationService,
          useValue: jasmine.createSpyObj('IconSetCustomizationService', [], {
            selectedActorsSignal: signal<string[]>([]),
            selectedWorkObjectsSignal: signal<string[]>([]),
          }),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconSetConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
