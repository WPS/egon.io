import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderButtonsComponent } from '../workbench/presentation/header/header-buttons/header-buttons.component';

@NgModule({
  declarations: [HeaderButtonsComponent],
  exports: [HeaderButtonsComponent],
  imports: [CommonModule],
})
export class DomainStoryModelerModuleModule {}
