import { ApplicationRef, DoBootstrap, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckboxDefaultOptions,
} from '@angular/material/checkbox';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from 'src/app/tool/header/presentation/header/header.component';
import { SettingsComponent } from 'src/app/Presentation/Settings/settings.component';
import { AppComponent } from 'src/app/workbench/app.component';
import { ExportService } from 'src/app/tool/export/service/export.service';
import { ImportDomainStoryService } from 'src/app/tool/import/service/import-domain-story.service';
import { ImportRepairService } from 'src/app/tool/import/service/import-repair.service';
import { ModelerService } from 'src/app/tool/modeler/service/modeler.service';
import { TitleService } from 'src/app/tool/header/service/title.service';
import { LabelDictionaryService } from 'src/app/tool/label-dictionary/service/label-dictionary.service';
import { ReplayService } from 'src/app/tool/replay/service/replay.service';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import { IconSetConfigurationService } from 'src/app/tool/icon-set-config/service/icon-set-configuration.service';
import { MassNamingService } from 'src/app/tool/label-dictionary/service/mass-naming.service';
import { TitleAndDescriptionDialogComponent } from 'src/app/tool/header/presentation/dialog/info-dialog/title-and-description-dialog.component';
import { ExportDialogComponent } from 'src/app/tool/export/presentation/export-dialog/export-dialog.component';
import { ActivityDialogComponent } from 'src/app/tool/modeler/presentation/activity-dialog/activity-dialog.component';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HeaderDialogComponent } from 'src/app/tool/header/presentation/dialog/header-dialog/header-dialog.component';
import { IconDictionaryService } from 'src/app/tool/icon-set-config/service/icon-dictionary.service';
import { ModelerComponent } from 'src/app/tool/modeler/presentation/modeler/modeler.component';
import { SettingsModule } from 'src/app/Modules/settings.module';
import { AutosaveService } from '../tool/autosave/service/autosave.service';
import { DomainStoryModelerModuleModule } from '../Modules/domain-story-modeler-module.module';
import { LabelDictionaryDialogComponent } from '../tool/label-dictionary/presentation/label-dictionary-dialog/label-dictionary-dialog.component';
import { MaterialModule } from '../material.module';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [
    HeaderComponent,
    SettingsComponent,
    AppComponent,
    TitleAndDescriptionDialogComponent,
    ExportDialogComponent,
    ActivityDialogComponent,
    HeaderDialogComponent,
    ModelerComponent,
    LabelDictionaryDialogComponent,
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    SettingsModule,
    DomainStoryModelerModuleModule,
    MaterialModule,
    ColorPickerModule,
  ],
  providers: [
    AutosaveService,
    ExportService,
    ImportDomainStoryService,
    ImportRepairService,
    IconDictionaryService,
    TitleService,
    LabelDictionaryService,
    ReplayService,
    ElementRegistryService,
    IconSetConfigurationService,
    ModelerService,
    MassNamingService,
    UntypedFormBuilder,
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: { clickAction: 'noop' } as MatCheckboxDefaultOptions,
    },
  ],
})
export class AppModule implements DoBootstrap {
  constructor(private autosaveService: AutosaveService) {
    // autosaveService wird so automatisch initialisiert, auf keinen Fall entfernen!
  }

  ngDoBootstrap(app: ApplicationRef): void {
    const componentElement = document.createElement('app-root');
    document.body.append(componentElement);
    app.bootstrap(AppComponent);
  }
}
