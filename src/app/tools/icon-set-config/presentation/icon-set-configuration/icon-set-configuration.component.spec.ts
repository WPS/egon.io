import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSetConfigurationComponent } from 'src/app/tools/icon-set-config/presentation/icon-set-configuration/icon-set-configuration.component';
import { MockProvider } from 'ng-mocks';
import { IconSetImportExportService } from '../../services/icon-set-import-export.service';
import { IconDictionaryService } from '../../services/icon-dictionary.service';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { IconSetComponent } from '../icon-set/icon-set.component';
import { Dictionary, Entry } from '../../../../domain/entities/dictionary';
import { signal } from '@angular/core';
import { IconFilterOptions } from '../../domain/iconFilterOptions';

describe(IconSetConfigurationComponent.name, () => {
  let component: IconSetConfigurationComponent;
  let fixture: ComponentFixture<IconSetConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSetConfigurationComponent, IconSetComponent],
      providers: [
        MockProvider(IconSetImportExportService, {
          iconSetName: signal('testIconSetName'),
        }),
        MockProvider(IconDictionaryService, {
          getFullDictionary(): Dictionary<string> {
            return new Dictionary<string>();
          },
        }),
        MockProvider(IconSetCustomizationService, {
          selectedActorsSignal: signal<string[]>([]),
          selectedWorkObjectsSignal: signal<string[]>([]),
        }),
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

  function customizationSpy(): jest.Mocked<IconSetCustomizationService> {
    return TestBed.inject(
      IconSetCustomizationService,
    ) as jest.Mocked<IconSetCustomizationService>;
  }

  it('loadMinimalIconConfigurationWithDefaultIcons should reset the icon set', () => {
    component.loadMinimalIconConfigurationWithDefaultIcons();
    expect(customizationSpy().resetIconSet).toHaveBeenCalled();
  });

  it('loadInitialConfiguration should cancel customization', () => {
    component.loadInitialConfiguration();
    expect(customizationSpy().cancel).toHaveBeenCalled();
  });

  it('saveIconSet should save the currently used icons', () => {
    component.saveIconSet();
    expect(customizationSpy().saveIconSet).toHaveBeenCalled();
  });

  describe('upload triggers', () => {
    let getByIdSpy: jest.SpyInstance;

    afterEach(() => getByIdSpy?.mockRestore());

    it('startIconUpload should click the hidden icon input', () => {
      const fakeInput = { click: jest.fn() };
      getByIdSpy = jest
        .spyOn(document, 'getElementById')
        .mockReturnValue(fakeInput as unknown as HTMLElement);

      component.startIconUpload();

      expect(getByIdSpy).toHaveBeenCalledWith('importIcon');
      expect(fakeInput.click).toHaveBeenCalled();
    });

    it('startIconSetImport should click the hidden icon set input', () => {
      const fakeInput = { click: jest.fn() };
      getByIdSpy = jest
        .spyOn(document, 'getElementById')
        .mockReturnValue(fakeInput as unknown as HTMLElement);

      component.startIconSetImport();

      expect(getByIdSpy).toHaveBeenCalledWith('importIconSet');
      expect(fakeInput.click).toHaveBeenCalled();
    });
  });

  describe('filters', () => {
    it('filterForActors should toggle the actor filter', () => {
      component.filterForActors();
      expect(component.filter()).toBe(IconFilterOptions.ONLY_ACTORS);
      component.filterForActors();
      expect(component.filter()).toBe(IconFilterOptions.NO_FILTER);
    });

    it('filterForWorkObjects should toggle the work object filter', () => {
      component.filterForWorkObjects();
      expect(component.filter()).toBe(IconFilterOptions.ONLY_WORKOBJECTS);
      component.filterForWorkObjects();
      expect(component.filter()).toBe(IconFilterOptions.NO_FILTER);
    });

    it('filterForUnassigned should toggle the unassigned filter', () => {
      component.filterForUnassigned();
      expect(component.filter()).toBe(IconFilterOptions.ONLY_UNASSIGNED);
      component.filterForUnassigned();
      expect(component.filter()).toBe(IconFilterOptions.NO_FILTER);
    });

    it('should recompute the filtered names for every filter type', () => {
      const customization = customizationSpy();
      customization.isIconActor.mockReturnValue(true);
      customization.isIconWorkObject.mockReturnValue(true);
      const dict = new Dictionary<string>();
      dict.set('apple', '<svg>a</svg>');
      dict.set('banana', '<svg>b</svg>');
      component.allIcons.set(dict);
      fixture.detectChanges();

      component.filterForActors();
      fixture.detectChanges();
      component.filterForWorkObjects();
      fixture.detectChanges();
      component.filterForUnassigned();
      fixture.detectChanges();

      expect(customization.isIconActor).toHaveBeenCalled();
      expect(customization.isIconWorkObject).toHaveBeenCalled();
    });

    it('filterByNameAndType should filter by name and keywords', () => {
      const dict = new Dictionary<string>();
      dict.putEntry(new Entry('<svg>a</svg>', 'apple', ['fruit']));
      dict.putEntry(new Entry('<svg>b</svg>', 'banana', ['yellow']));
      component.allIcons.set(dict);
      fixture.detectChanges();

      const nameInput = document.createElement('input');
      nameInput.value = 'app';
      component.filterByNameAndType({ target: nameInput } as unknown as Event);
      expect(component.allFilteredIconNames()).toEqual(['apple']);

      const keywordInput = document.createElement('input');
      keywordInput.value = 'fru';
      component.filterByNameAndType({
        target: keywordInput,
      } as unknown as Event);
      expect(component.allFilteredIconNames()).toEqual(['apple']);
    });
  });

  describe('imports', () => {
    let getByIdSpy: jest.SpyInstance;

    afterEach(() => getByIdSpy?.mockRestore());

    it('importIcon should read the file and register a custom icon', async () => {
      const iconDictionary = TestBed.inject(
        IconDictionaryService,
      ) as jest.Mocked<IconDictionaryService>;
      const file = new File(['<svg></svg>'], 'MyIcon.svg', {
        type: 'image/svg+xml',
      });
      getByIdSpy = jest
        .spyOn(document, 'getElementById')
        .mockReturnValue({ files: [file] } as unknown as HTMLElement);

      // Deterministically resolve the FileReader read (jsdom timing-independent).
      const originalFileReader = global.FileReader;
      class MockFileReader {
        onloadend: ((e: any) => void) | null = null;
        onerror: (() => void) | null = null;
        readAsDataURL(): void {
          this.onloadend?.({
            target: { result: 'data:image/svg+xml;base64,abc' },
          });
        }
      }
      (global as any).FileReader = MockFileReader;

      try {
        await component.importIcon();
      } finally {
        (global as any).FileReader = originalFileReader;
      }

      expect(iconDictionary.addCustomIcon).toHaveBeenCalledWith(
        'data:image/svg+xml;base64,abc',
        expect.stringContaining('-custom'),
      );
      expect(customizationSpy().addNewCustomIcon).toHaveBeenCalledWith(
        expect.stringContaining('-custom'),
      );
    });

    it('importIconSet should load and import the parsed configuration', async () => {
      const importExport = TestBed.inject(
        IconSetImportExportService,
      ) as jest.Mocked<IconSetImportExportService>;
      const config = {
        name: 's',
        actors: new Dictionary<string>(),
        workObjects: new Dictionary<string>(),
      };
      importExport.createIconSetConfiguration.mockReturnValue(config);

      const fakeFile = {
        text: () =>
          Promise.resolve(
            JSON.stringify({ name: 's', actors: {}, workObjects: {} }),
          ),
      };
      getByIdSpy = jest
        .spyOn(document, 'getElementById')
        .mockReturnValue({ files: [fakeFile] } as unknown as HTMLElement);

      await component.importIconSet();

      expect(importExport.loadIconSet).toHaveBeenCalledWith(config, false);
      expect(customizationSpy().importConfiguration).toHaveBeenCalledWith(
        config,
      );
    });
  });
});
