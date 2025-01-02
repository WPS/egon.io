import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { TitleService } from 'src/app/tools/title/services/title.service';
import { TitleDialogForm } from '../../domain/title-dialog-form';
import { DirtyFlagService } from '../../../../domain/services/dirty-flag.service';

@Component({
  selector: 'app-header-dialog',
  templateUrl: './title-dialog.component.html',
  styleUrls: ['./title-dialog.component.scss'],
  standalone: false,
})
export class TitleDialogComponent implements OnInit {
  form!: FormGroup<TitleDialogForm>;

  constructor(
    private dialogRef: MatDialogRef<TitleDialogComponent>,
    private titleService: TitleService,
    private dirtyFlagService: DirtyFlagService,
  ) {}

  ngOnInit(): void {
    const title = this.titleService.getTitle();
    const description = this.titleService.getDescription();

    this.form = TitleDialogForm.create(title, description);
  }

  save(): void {
    if (this.form.dirty) {
      this.dirtyFlagService.makeDirty();

      this.titleService.updateTitleAndDescription(
        this.form.getRawValue().title,
        this.form.getRawValue().description,
        true,
      );
    }
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  preventDefault(event: Event) {
    event.preventDefault();
  }
}
