import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TitleService } from 'src/app/Service/Title/title.service';

@Component({
  selector: 'app-header-dialog',
  templateUrl: './header-dialog.component.html',
  styleUrls: ['./header-dialog.component.scss'],
})
export class HeaderDialogComponent implements OnInit {
  form: UntypedFormGroup;
  title: string;
  description: string;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<HeaderDialogComponent>,
    private titleService: TitleService
  ) {
    this.title =
      this.titleService.getTitle() === '< name of this Domain Story >'
        ? ''
        : this.titleService.getTitle();
    this.description = this.titleService.getDescription();

    this.form = this.fb.group({
      title: [this.title, []],
      description: [this.description, []],
    });
  }

  ngOnInit(): void {}

  save(): void {
    this.titleService.updateTitleAndDescription(
      this.form.get('title')?.value,
      this.form.get('description')?.value,
      true
    );
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
