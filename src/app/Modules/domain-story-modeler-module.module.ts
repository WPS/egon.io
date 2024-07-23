import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderButtonsComponent } from '../Presentation/Header/components/header-buttons/header-buttons.component';

@NgModule({
  declarations: [HeaderButtonsComponent],
  exports: [HeaderButtonsComponent],
  imports: [CommonModule],
})
export class DomainStoryModelerModuleModule {}
