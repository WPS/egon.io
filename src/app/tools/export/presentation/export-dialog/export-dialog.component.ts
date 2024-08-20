import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ExportDialogData, ExportLocation, ExportOption} from 'src/app/tools/export/domain/dialog/exportDialogData';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import {isDecoratorOptionsInterface} from "@angular/compiler-cli/src/ngtsc/docs/src/decorator_extractor";

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements OnInit {
  title: string;
  options: ExportOption[];
  withTitle: BehaviorSubject<boolean>;
  useWhiteBackground: BehaviorSubject<boolean>;

  optionMap = new Map<ExportLocation, ExportOption[]>()

  localOptions: ExportOption[] = []
  dropboxOtions: ExportOption[] = []

  constructor(
    private dialogRef: MatDialogRef<ExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ExportDialogData,
  ) {
    this.withTitle = new BehaviorSubject<boolean>(true);
    this.useWhiteBackground = new BehaviorSubject<boolean>(true);
    this.title = data.title;
    this.options = data.options;
  }

  ngOnInit(): void {
    // sort options according there exportLocation
    // this.options.forEach(it => {
    //   if (it.exportLocation === 'LOCAL') {
    //     this.localOptions.push(it)
    //   }
    //
    //   if (it.exportLocation === 'DROPBOX') {
    //     this.dropboxOtions.push(it)
    //   }
    // })

    // this.options = this.options.sort(it => it.exportLocation.localeCompare(it.exportLocation))
  }

  doOption(i: number): void {
    this.options[i].fn(this.withTitle.value, this.useWhiteBackground.value);
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  updateWithTitle($event: Event) {
    // @ts-ignore
    this.withTitle.next($event.target.checked);
  }

  updateUseWhiteBackground($event: Event) {
    // @ts-ignore
    this.useWhiteBackground.next($event.target.checked);
  }
}
