import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { TitleService } from 'src/app/tool/header/service/title.service';
import { HeaderDialogForm } from '../../../../../Presentation/Dialog/dialog-forms/header-dialog-form';
import { DirtyFlagService } from '../../../../../Service/DirtyFlag/dirty-flag.service';

@Component({
  selector: 'app-header-dialog',
  templateUrl: './header-dialog.component.html',
  styleUrls: ['./header-dialog.component.scss'],
})
export class HeaderDialogComponent implements OnInit {
  form!: FormGroup<HeaderDialogForm>;

  constructor(
    private dialogRef: MatDialogRef<HeaderDialogComponent>,
    private titleService: TitleService,
    private dirtyFlagService: DirtyFlagService,
  ) {}

  ngOnInit(): void {
    const title = this.titleService.getTitle();
    const description = this.titleService.getDescription();

    this.form = HeaderDialogForm.create(title, description);
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
