import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/overlay';
import { KeyboardShortcutsDialogComponent } from '../presentation/keyboard-shortcuts-dialog/keyboard-shortcuts/keyboard-shortcuts-dialog.component';
import { ShortCut } from '../entities/shortcut-dialog-data';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private matDialog: MatDialog) {}

  openDialog(dialog: ComponentType<any>, config: MatDialogConfig): void {
    this.matDialog.open(dialog, config);
  }

  openKeyboardShortcutsDialog(): void {
    const shortCuts: ShortCut[] = [];
    shortCuts.push({ description: 'Undo', shortCut: 'ctrl + Z' });
    shortCuts.push({
      description: 'Redo',
      shortCut: 'ctrl + Y    OR   ctrl + shift + Z',
    });
    shortCuts.push({ description: 'Select All', shortCut: 'ctrl + A' });
    shortCuts.push({ description: 'Export as EGN', shortCut: 'ctrl + S' });
    shortCuts.push({
      description: 'Export as SVG',
      shortCut: 'ctrl + alt + S',
    });
    shortCuts.push({
      description: 'Import Domain Story',
      shortCut: 'ctrl + L',
    });
    shortCuts.push({ description: 'Search for text', shortCut: 'ctrl + F' });
    shortCuts.push({ description: 'Direct editing', shortCut: 'E' });
    shortCuts.push({ description: 'Hand tool', shortCut: 'H' });
    shortCuts.push({ description: 'Lasso tool', shortCut: 'L' });
    shortCuts.push({ description: 'Space tool', shortCut: 'S' });

    const config = new MatDialogConfig();

    config.data = {
      title: 'Keyboard Shortcuts',
      shortCuts: shortCuts,
    };

    this.openDialog(KeyboardShortcutsDialogComponent, config);
  }
}
