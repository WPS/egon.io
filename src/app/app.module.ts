import { ApplicationRef, DoBootstrap, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckboxDefaultOptions,
} from '@angular/material/checkbox';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from 'src/app/Presentation/Header/header.component';
import { SettingsComponent } from 'src/app/Presentation/Settings/settings.component';
import { AppComponent } from 'src/app/app.component';
import { ExportService } from 'src/app/Service/Export/export.service';
import { ImportDomainStoryService } from 'src/app/Service/Import/import-domain-story.service';
import { ImportRepairService } from 'src/app/Service/Import/import-repair.service';
import { ModelerService } from 'src/app/Service/Modeler/modeler.service';
import { TitleService } from 'src/app/Service/Title/title.service';
import { LabelDictionaryService } from 'src/app/Service/LabelDictionary/label-dictionary.service';
import { ReplayService } from 'src/app/Service/Replay/replay.service';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import { DomainConfigurationService } from 'src/app/Service/DomainConfiguration/domain-configuration.service';
import { MassNamingService } from 'src/app/Service/LabelDictionary/mass-naming.service';
import { InfoDialogComponent } from 'src/app/Presentation/Dialog/info-dialog/info-dialog.component';
import { ExportDialogComponent } from 'src/app/Presentation/Dialog/export-dialog/export-dialog.component';
import { ActivityDialogComponent } from 'src/app/Presentation/Dialog/activity-dialog/activity-dialog.component';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HeaderDialogComponent } from 'src/app/Presentation/Dialog/header-dialog/header-dialog.component';
import { IconDictionaryService } from 'src/app/Service/DomainConfiguration/icon-dictionary.service';
import { ModelerComponent } from 'src/app/Presentation/Canvas/modeler.component';
import { SettingsModule } from 'src/app/Modules/settings.module';
import { AutosaveService } from './Service/Autosave/autosave.service';
import { DomainStoryModelerModuleModule } from './Modules/domain-story-modeler-module.module';
import { LabelDictionaryDialogComponent } from './Presentation/Dialog/label-dictionary-dialog/label-dictionary-dialog.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
    LabelDictionaryDialogComponent,
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    SettingsModule,
    DomainStoryModelerModuleModule,
    MatToolbarModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatCardModule,
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
        UntypedFormBuilder,
        {
            provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
            useValue: { clickAction: 'noop' } as MatCheckboxDefaultOptions,
        },
    ]
})
export class AppModule implements DoBootstrap {
  ngDoBootstrap(app: ApplicationRef): void {
    const componentElement = document.createElement('app-root');
    document.body.append(componentElement);
    app.bootstrap(AppComponent);
  }
}
