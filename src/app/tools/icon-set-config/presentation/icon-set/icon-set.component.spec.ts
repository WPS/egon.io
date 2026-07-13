import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSetComponent } from './icon-set.component';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { signal } from '@angular/core';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { MockProvider } from 'ng-mocks';

describe(IconSetComponent.name, () => {
  let component: IconSetComponent;
  let fixture: ComponentFixture<IconSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSetComponent],
      providers: [
        MockProvider(IconSetCustomizationService, {
          selectedActorsSignal: signal<string[]>([]),
          selectedWorkObjectsSignal: signal<string[]>([]),
        }),
        MockProvider(IconSetImportExportService, {
          iconSetName: signal<string>(''),
        }),
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
