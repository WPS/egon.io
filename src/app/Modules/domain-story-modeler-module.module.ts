import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderButtonsComponent} from '../Presentation/Header/header-buttons.component';
import {MatMenuModule} from "@angular/material/menu";

@NgModule({
  declarations: [HeaderButtonsComponent],
  exports: [HeaderButtonsComponent],
  imports: [CommonModule, MatMenuModule],
})
export class DomainStoryModelerModuleModule {
}
