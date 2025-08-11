import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { HeaderComponent } from './header/header/header.component';
import { HeaderButtonsComponent } from './header/header-buttons/header-buttons.component';
import { SettingsComponent } from './settings/settings.component';
import { IconSetConfigModule } from '../../tools/icon-set-config/presentation/icon-set-config.module';
import { AutosaveModule } from '../../tools/autosave/presentation/autosave.module';

@NgModule({
  declarations: [HeaderComponent, HeaderButtonsComponent, SettingsComponent],
  exports: [HeaderComponent, HeaderButtonsComponent, SettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    IconSetConfigModule,
    AutosaveModule,
  ],
})
export class WorkbenchModule {}
