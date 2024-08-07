import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderButtonsComponent } from './header-buttons/header-buttons.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [HeaderButtonsComponent],
  exports: [HeaderButtonsComponent],
    imports: [CommonModule, FormsModule],
})
export class DomainStoryModelerModuleModule {}
