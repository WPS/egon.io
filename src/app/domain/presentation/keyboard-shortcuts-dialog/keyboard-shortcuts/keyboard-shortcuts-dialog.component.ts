import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ShortcutDialogData, ShortCut} from "../../../entities/shortcut-dialog-data";

@Component({
  selector: 'app-keyboard-shortcuts-dialog',
  templateUrl: './keyboard-shortcuts-dialog.component.html',
  styleUrl: './keyboard-shortcuts-dialog.component.scss'
})
export class KeyboardShortcutsDialogComponent {
  title: string;
  shortCuts: ShortCut[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: ShortcutDialogData,
  ) {
    this.title = data.title;
    this.shortCuts = data.shortCuts ?? []
  }

}
