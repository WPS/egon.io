import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {
  ShortCut,
  ShortcutDialogData,
} from 'src/app/tools/keyboard-shortcuts/domain/shortcut-dialog-data';

@Component({
  selector: 'app-keyboard-shortcuts-dialog',
  templateUrl: './keyboard-shortcuts-dialog.component.html',
  styleUrl: './keyboard-shortcuts-dialog.component.scss',

  imports: [MatDialogModule],
})
export class KeyboardShortcutsDialogComponent {
  private data = inject<ShortcutDialogData>(MAT_DIALOG_DATA);

  readonly title: string = this.data.title;
  readonly shortCuts: ShortCut[] = this.data.shortCuts ?? [];
}
