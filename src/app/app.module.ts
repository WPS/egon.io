import {
  APP_INITIALIZER,
  ApplicationRef,
  DoBootstrap,
  NgModule,
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
import { IconSetConfigurationService } from 'src/app/tools/icon-set-config/services/icon-set-configuration.service';
import { UntypedFormBuilder } from '@angular/forms';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { AutosaveService } from './tools/autosave/services/autosave.service';
import { MaterialModule } from './material.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { DirtyFlagService } from './domain/services/dirty-flag.service';
import { IconSetChangedService } from './tools/icon-set-config/services/icon-set-customization.service';
import { initializeContextPadProvider } from './tools/modeler/bpmn/modeler/context-pad/domainStoryContextPadProvider';
import { initializePalette } from './tools/modeler/bpmn/modeler/palette/domainStoryPalette';
import { initializeRenderer } from './tools/modeler/bpmn/modeler/domainStoryRenderer';
import { initializeLabelEditingProvider } from './tools/modeler/bpmn/modeler/labeling/dsLabelEditingProvider';
import { initializeReplaceOptions } from './tools/modeler/bpmn/modeler/change-icon/replaceOptions';
import { initializeNumbering } from './tools/modeler/bpmn/modeler/numbering/numbering';
import { initializeActivityUpdateHandler } from './tools/modeler/bpmn/modeler/updateHandler/activityUpdateHandlers';
import { WorkbenchModule } from './workbench/presentation/workbench.module';
import { DomainModule } from './domain/presentation/domain.module';
import { AutosaveModule } from './tools/autosave/presentation/autosave.module';
import { ExportModule } from './tools/export/presentation/export.module';
import { IconSetConfigModule } from './tools/icon-set-config/presentation/icon-set-config.module';
import { ImportModule } from './tools/import/presentation/import.module';
import { LabelDictionaryModule } from './tools/label-dictionary/presentation/label-dictionary.module';
import { ModelerModule } from './tools/modeler/presentation/modeler.module';
import { TitleModule } from './tools/title/presentation/title.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    MaterialModule,
    ColorPickerModule,
    WorkbenchModule,
    AutosaveModule,
    ExportModule,
    IconSetConfigModule,
    ImportModule,
    LabelDictionaryModule,
    ModelerModule,
    TitleModule,
    DomainModule,
  ],
  providers: [
    UntypedFormBuilder,
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: { clickAction: 'noop' } as MatCheckboxDefaultOptions,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initialize,
      multi: true,
      deps: [
        DirtyFlagService,
        IconDictionaryService,
        IconSetConfigurationService,
        ElementRegistryService,
        LabelDictionaryService,
      ],
    },
    {
      provide: IconSetChangedService,
      useExisting: ImportDomainStoryService,
    },
  ],
})
export class AppModule {
  constructor(private autosaveService: AutosaveService) {
    // autosaveService wird so automatisch initialisiert, auf keinen Fall entfernen!
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
  configurationService: IconSetConfigurationService,
  elementRegistryService: ElementRegistryService,
  labelDictionaryService: LabelDictionaryService,
) {
  return () => {
    initializeContextPadProvider(dirtyFlagService, iconDictionaryService);

    /** The Palette and the Context Menu need the Icons present in the Domain,
     * so the IconDictionaryService and the IconSetConfigurationService needs to be given to the Palette **/
    initializePalette(iconDictionaryService, configurationService);
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
