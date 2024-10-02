import {NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import {
  KeyboardShortcutsDialogComponent
} from "./keyboard-shortcuts-dialog/keyboard-shortcuts/keyboard-shortcuts-dialog.component";

@NgModule({
  declarations: [KeyboardShortcutsDialogComponent],
  exports: [KeyboardShortcutsDialogComponent],
  imports: [CommonModule, MaterialModule],
})
export class DomainModule {}
