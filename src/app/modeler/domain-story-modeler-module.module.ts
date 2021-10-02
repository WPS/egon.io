import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderButtonsComponent } from '../header/component/header-buttons.component';

@NgModule({
  declarations: [HeaderButtonsComponent],
  exports: [HeaderButtonsComponent],
  imports: [CommonModule],
})
export class DomainStoryModelerModuleModule {}
