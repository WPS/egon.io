import { NgModule } from '@angular/core';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import {
  KeyboardShortcutsDialogComponent
} from "./keyboard-shortcuts-dialog/keyboard-shortcuts/keyboard-shortcuts-dialog.component";

@NgModule({
  declarations: [InfoDialogComponent, KeyboardShortcutsDialogComponent],
  exports: [InfoDialogComponent, KeyboardShortcutsDialogComponent],
  imports: [CommonModule, MaterialModule],
})
export class DomainModule {}
