import {
  ApplicationRef,
  DoBootstrap,
  NgModule,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckboxDefaultOptions,
} from '@angular/material/checkbox';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from 'src/app/app.component';
import { ImportDomainStoryService } from 'src/app/tools/import/services/import-domain-story.service';
import { LabelDictionaryService } from 'src/app/tools/label-dictionary/services/label-dictionary.service';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { UntypedFormBuilder } from '@angular/forms';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { AutosaveService } from './tools/autosave/services/autosave.service';
import { MaterialModule } from './material.module';
import { ColorPickerDirective } from 'ngx-color-picker';
import { DirtyFlagService } from './domain/services/dirty-flag.service';
import { IconSetChangedService } from './tools/icon-set-config/services/icon-set-customization.service';
import { initializeContextPadProvider } from './tools/modeler/diagram-js/features/context-pad/domainStoryContextPadProvider';
import { initializePalette } from './tools/modeler/diagram-js/features/palette/domainStoryPalette';
import { initializeRenderer } from './tools/modeler/diagram-js/features/domainStoryRenderer';
import { initializeLabelEditingProvider } from './tools/modeler/diagram-js/features/labeling/dsLabelEditingProvider';
import { initializeReplaceOptions } from './tools/modeler/diagram-js/features/change-icon/replaceOptions';
import { initializeNumbering } from './tools/modeler/diagram-js/features/numbering/numbering';
import { initializeActivityUpdateHandler } from './tools/modeler/diagram-js/features/updateHandler/activityUpdateHandlers';
import { WorkbenchModule } from './workbench/presentation/workbench.module';
import { DomainModule } from './domain/presentation/domain.module';
import { AutosaveModule } from './tools/autosave/presentation/autosave.module';
import { ExportModule } from './tools/export/presentation/export.module';
import { IconSetConfigModule } from './tools/icon-set-config/presentation/icon-set-config.module';
import { ImportModule } from './tools/import/presentation/import.module';
import { LabelDictionaryModule } from './tools/label-dictionary/presentation/label-dictionary.module';
import { ModelerModule } from './tools/modeler/presentation/modeler.module';
import { TitleModule } from './tools/title/presentation/title.module';
import { DragDirective } from './tools/import/directive/dragDrop.directive';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    MaterialModule,
    ColorPickerDirective,
    WorkbenchModule,
    AutosaveModule,
    ExportModule,
    IconSetConfigModule,
    ImportModule,
    LabelDictionaryModule,
    ModelerModule,
    TitleModule,
    DomainModule,
    DragDirective,
  ],
  providers: [
    UntypedFormBuilder,
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: { clickAction: 'noop' } as MatCheckboxDefaultOptions,
    },
    provideAppInitializer(() => {
      const initializerFn = initialize(
        inject(DirtyFlagService),
        inject(IconDictionaryService),
        inject(IconSetImportExportService),
        inject(ElementRegistryService),
        inject(LabelDictionaryService),
      );
      return initializerFn();
    }),
    {
      provide: IconSetChangedService,
      useExisting: ImportDomainStoryService,
    },
  ],
})
export class AppModule implements DoBootstrap {
  constructor(private autosaveService: AutosaveService) {
    // Needed to initialize autosaveService. Do not remove!
  }

  ngDoBootstrap(app: ApplicationRef): void {
    const componentElement = document.createElement('app-root');
    document.body.append(componentElement);
    app.bootstrap(AppComponent);
  }
}

function initialize(
  dirtyFlagService: DirtyFlagService,
  iconDictionaryService: IconDictionaryService,
  importExportService: IconSetImportExportService,
  elementRegistryService: ElementRegistryService,
  labelDictionaryService: LabelDictionaryService,
) {
  return () => {
    initializeContextPadProvider(dirtyFlagService, iconDictionaryService);

    initializePalette(iconDictionaryService);
    initializeRenderer(
      iconDictionaryService,
      elementRegistryService,
      dirtyFlagService,
    );
    initializeLabelEditingProvider(labelDictionaryService);
    initializeReplaceOptions(iconDictionaryService);
    initializeNumbering(elementRegistryService);
    initializeActivityUpdateHandler(elementRegistryService);
  };
}
