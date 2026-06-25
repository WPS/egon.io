import { Component, inject, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { PropertiesDialogForm } from 'src/app/tools/properties/domain/properties-dialog-form';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  DomainPurity,
  PointInTime,
  Scope,
} from 'src/app/domain/entities/scope';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';

@Component({
  selector: 'app-properties-dialog',
  templateUrl: './properties-dialog.component.html',
  styleUrls: ['./properties-dialog.component.scss'],

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleGroup,
    MatButtonToggle,
  ],
})
export class PropertiesDialogComponent implements OnInit {
  form!: FormGroup<PropertiesDialogForm>;

  private dialogRef = inject(MatDialogRef<PropertiesDialogComponent>);
  private propertiesService = inject(PropertiesService);
  private dirtyFlagService = inject(DirtyFlagService);

  ngOnInit(): void {
    const title = this.propertiesService.getTitle();
    const description = this.propertiesService.getDescription();
    const scope = this.propertiesService.getScope();

    this.form = PropertiesDialogForm.create(
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

      this.propertiesService.updateTitleAndDescriptionAndScope(
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

  pointInTime(): PointInTime | null {
    return this.form.getRawValue().pointInTime;
  }

  domainPurity(): DomainPurity | null {
    return this.form.getRawValue().domainPurity;
  }
}
