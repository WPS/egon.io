import { Component, inject, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TitleService } from 'src/app/tools/title/services/title.service';
import { TitleDialogForm } from '../../domain/title-dialog-form';
import { DirtyFlagService } from '../../../../domain/services/dirty-flag.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  DomainPurity,
  PointInTime,
  Scope,
} from 'src/app/domain/entities/scope';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
  selector: 'app-header-dialog',
  templateUrl: './title-dialog.component.html',
  styleUrls: ['./title-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioGroup,
    MatRadioButton,
  ],
})
export class TitleDialogComponent implements OnInit {
  form!: FormGroup<TitleDialogForm>;

  private dialogRef = inject(MatDialogRef<TitleDialogComponent>);
  private titleService = inject(TitleService);
  private dirtyFlagService = inject(DirtyFlagService);

  ngOnInit(): void {
    const title = this.titleService.getTitle();
    const description = this.titleService.getDescription();
    const scope = this.titleService.getScope();

    this.form = TitleDialogForm.create(
      title,
      description,
      scope?.granularity ? scope.granularity : '',
      scope?.pointInTime ? scope.pointInTime : null,
      scope?.domainPurity ? scope.domainPurity : null,
    );
  }

  save(): void {
    if (this.form.dirty) {
      this.dirtyFlagService.makeDirty();

      const granularity = this.form.getRawValue().granularity;
      const pointInTime = this.form.getRawValue().pointInTime;
      const domainPurity = this.form.getRawValue().domainPurity;

      const scope: Scope = {
        granularity: granularity ? granularity : '',
        pointInTime: pointInTime ? pointInTime : undefined,
        domainPurity: domainPurity ? domainPurity : undefined,
      };

      this.titleService.updateTitleAndDescriptionAndScope(
        this.form.getRawValue().title,
        this.form.getRawValue().description,
        scope,
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

  protected readonly PointInTime = PointInTime;
  protected readonly DomainPurity = DomainPurity;
}
