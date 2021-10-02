import { ApplicationRef, DoBootstrap, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckboxDefaultOptions,
  MatCheckboxModule,
} from '@angular/material/checkbox';

import { AppRoutingModule } from 'src/app/app-routing.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from 'src/app/header/component/header.component';
import { SettingsComponent } from 'src/app/settings-module/component/settings.component';
import { AppComponent } from 'src/app/app.component';
import { ExportService } from 'src/app/export/service/export.service';
import { ImportDomainStoryService } from 'src/app/import-service/import-domain-story.service';
import { ImportRepairService } from 'src/app/import-service/import-repair.service';
import { ModelerService } from 'src/app/modeler/service/modeler.service';
import { TitleService } from 'src/app/titleAndDescription/service/title.service';
import { LabelDictionaryService } from 'src/app/label-dictionary/service/label-dictionary.service';
import { ReplayService } from 'src/app/replay-service/replay.service';
import { ElementRegistryService } from 'src/app/elementRegistry-service/element-registry.service';
import { DomainConfigurationService } from 'src/app/domain-configuration/service/domain-configuration.service';
import { MassNamingService } from 'src/app/label-dictionary/service/mass-naming.service';
import { InfoDialogComponent } from 'src/app/dialog/component/confirm-dialog/info-dialog.component';
import { ExportDialogComponent } from 'src/app/export/component/export-dialog/export-dialog.component';
import { ActivityDialogComponent } from 'src/app/modeler/component/activity-dialog/activity-dialog.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HeaderDialogComponent } from 'src/app/header/header-dialog/header-dialog.component';
import { IconDictionaryService } from 'src/app/domain-configuration/service/icon-dictionary.service';
import { ModelerComponent } from 'src/app/modeler/component/modeler.component';
import { SettingsModule } from 'src/app/settings-module/settings.module';
import { MatTabsModule } from '@angular/material/tabs';
import { AutosaveService } from './autosave/service/autosave.service';
import { TitleComponent } from './titleAndDescription/title/component/title.component';
import { DescriptionComponent } from './titleAndDescription/description/component/description.component';
import { DomainStoryModelerModuleModule } from './modeler/domain-story-modeler-module.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    HeaderComponent,
    SettingsComponent,
    AppComponent,
    InfoDialogComponent,
    ExportDialogComponent,
    ActivityDialogComponent,
    HeaderDialogComponent,
    ModelerComponent,
    TitleComponent,
    DescriptionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatTabsModule,
    ReactiveFormsModule,
    SettingsModule,
    DomainStoryModelerModuleModule,
    MatButtonModule,
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
    DomainConfigurationService,
    ModelerService,
    MassNamingService,
    FormBuilder,
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: { clickAction: 'noop' } as MatCheckboxDefaultOptions,
    },
  ],
  entryComponents: [AppComponent],
})
export class AppModule implements DoBootstrap {
  ngDoBootstrap(app: ApplicationRef): void {
    const componentElement = document.createElement('app-root');
    document.body.append(componentElement);
    app.bootstrap(AppComponent);
  }
}
