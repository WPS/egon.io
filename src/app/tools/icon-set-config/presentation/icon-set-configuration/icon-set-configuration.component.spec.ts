import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSetConfigurationComponent } from 'src/app/tools/icon-set-config/presentation/icon-set-configuration/icon-set-configuration.component';
import { MockModule, MockProvider, MockProviders } from 'ng-mocks';
import { IconSetImportExportService } from '../../services/icon-set-import-export.service';
import { IconDictionaryService } from '../../services/icon-dictionary.service';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { IconSetComponent } from '../icon-set/icon-set.component';
import { MaterialModule } from 'src/app/material.module';
import { Dictionary } from '../../../../domain/entities/dictionary';

describe(IconSetConfigurationComponent.name, () => {
  let component: IconSetConfigurationComponent;
  let fixture: ComponentFixture<IconSetConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [IconSetConfigurationComponent, IconSetComponent],
      providers: [
        MockProviders(IconSetImportExportService),
        MockProvider(IconDictionaryService, {
          getFullDictionary(): Dictionary {
            return new Dictionary();
          },
        }),
        MockProvider(IconSetCustomizationService),
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
