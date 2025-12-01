import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { SelectedIconComponent } from './selected-icon/selected-icon.component';
import { SelectableIconComponent } from './selectable-icon/selectable-icon.component';
import { IconSetConfigurationComponent } from './icon-set-configuration/icon-set-configuration.component';
import { IconSetComponent } from './icon-set/icon-set.component';

@NgModule({
  declarations: [
    SelectedIconComponent,
    SelectableIconComponent,
    IconSetConfigurationComponent,
    IconSetComponent,
  ],
  exports: [
    SelectedIconComponent,
    SelectableIconComponent,
    IconSetConfigurationComponent,
    IconSetComponent,
  ],
  imports: [CommonModule, MaterialModule],
})
export class IconSetConfigModule {}
