import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSetComponent } from './icon-set.component';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { signal } from '@angular/core';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';

describe(IconSetComponent.name, () => {
  let component: IconSetComponent;
  let fixture: ComponentFixture<IconSetComponent>;

  beforeEach(async () => {
    const iconSetCustomizationServiceMock = jasmine.createSpyObj(
      'IconSetCustomizationService',
      ['getIconForName'],
      {
        selectedActorsSignal: signal<string[]>([]),
        selectedWorkObjectsSignal: signal<string[]>([]),
      },
    );

    const iconSetImportExportServiceMock = jasmine.createSpyObj(
      'IconSetImportExportService',
      ['importIconSet', 'exportIconSet'],
      { iconSetName: signal<string>('') },
    );

    await TestBed.configureTestingModule({
      imports: [IconSetComponent],
      providers: [
        {
          provide: IconSetCustomizationService,
          useValue: iconSetCustomizationServiceMock,
        },
        {
          provide: IconSetImportExportService,
          useValue: iconSetImportExportServiceMock,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
