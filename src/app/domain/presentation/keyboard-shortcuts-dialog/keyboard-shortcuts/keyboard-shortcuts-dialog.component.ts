import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {
  ShortCut,
  ShortcutDialogData,
} from '../../../entities/shortcut-dialog-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-keyboard-shortcuts-dialog',
  templateUrl: './keyboard-shortcuts-dialog.component.html',
  styleUrl: './keyboard-shortcuts-dialog.component.scss',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
})
export class KeyboardShortcutsDialogComponent {
  title: string;
  shortCuts: ShortCut[] = [];

  constructor() {
    const data = inject<ShortcutDialogData>(MAT_DIALOG_DATA);
    this.title = data.title;
    this.shortCuts = data.shortCuts ?? [];
  }
}
