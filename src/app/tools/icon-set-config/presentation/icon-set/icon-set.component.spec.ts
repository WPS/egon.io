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

  it('changeName should forward the entered name to the service', () => {
    const customization = TestBed.inject(
      IconSetCustomizationService,
    ) as jest.Mocked<IconSetCustomizationService>;
    const input = document.createElement('input');
    input.value = 'New Set';

    component.changeName({ target: input } as unknown as Event);

    expect(customization.changeName).toHaveBeenCalledWith('New Set');
  });

  it('getIconForName should unwrap the icon value from the service', () => {
    const customization = TestBed.inject(
      IconSetCustomizationService,
    ) as jest.Mocked<IconSetCustomizationService>;
    const icon = { name: 'Person' } as any;
    customization.getIconForName.mockReturnValue({ value: icon } as any);

    expect(component.getIconForName('Person')).toBe(icon);
  });

  describe('drag & drop', () => {
    it('allowDrop should prevent default only for the dragged list', () => {
      component.onDragStart(0, 'actors');

      const matching = { preventDefault: jest.fn() } as unknown as DragEvent;
      component.allowDrop(matching, 'actors');
      expect(matching.preventDefault).toHaveBeenCalled();

      const other = { preventDefault: jest.fn() } as unknown as DragEvent;
      component.allowDrop(other, 'workObjects');
      expect(other.preventDefault).not.toHaveBeenCalled();
    });

    it('onDrop should reorder the actor list and notify the service', () => {
      const customization = TestBed.inject(
        IconSetCustomizationService,
      ) as jest.Mocked<IconSetCustomizationService>;
      component.selectedActorsSignal.set(['a', 'b', 'c']);
      component.onDragStart(0, 'actors');

      component.onDrop(
        { preventDefault: jest.fn() } as unknown as DragEvent,
        'a',
        true,
        2,
      );

      expect(component.selectedActorsSignal()).toEqual(['b', 'c', 'a']);
      expect(customization.setSelectedActors).toHaveBeenCalledWith([
        'b',
        'c',
        'a',
      ]);
    });

    it('onDrop should reorder the work object list and notify the service', () => {
      const customization = TestBed.inject(
        IconSetCustomizationService,
      ) as jest.Mocked<IconSetCustomizationService>;
      component.selectedWorkObjectsSignal.set(['a', 'b', 'c']);
      component.onDragStart(2, 'workObjects');

      component.onDrop(
        { preventDefault: jest.fn() } as unknown as DragEvent,
        'c',
        false,
        0,
      );

      expect(component.selectedWorkObjectsSignal()).toEqual(['c', 'a', 'b']);
      expect(customization.setSelectedWorkObject).toHaveBeenCalledWith([
        'c',
        'a',
        'b',
      ]);
    });
  });

  it('exportIconSet should trigger the export', () => {
    const importExport = TestBed.inject(
      IconSetImportExportService,
    ) as jest.Mocked<IconSetImportExportService>;

    component.exportIconSet();

    expect(importExport.exportConfiguration).toHaveBeenCalled();
  });
});
