import { Component, inject, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { PropertiesForm } from 'src/app/tools/properties/domain/properties-form';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  DomainPurity,
  Granularity_Goal,
  Granularity_Grain,
  PointInTime,
  Scope,
} from 'src/app/domain/entities/scope';
import { MatOptgroup, MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-properties-dialog',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOption,
    MatSelect,
    MatOptgroup,
  ],
})
export class PropertiesComponent implements OnInit {
  form!: FormGroup<PropertiesForm>;

  private propertiesService = inject(PropertiesService);
  private dirtyFlagService = inject(DirtyFlagService);

  ngOnInit(): void {
    const title = this.propertiesService.getTitle();
    const description = this.propertiesService.getDescription();
    const scope = this.propertiesService.getScope();

    this.form = PropertiesForm.create(
      title,
      description,
      scope?.granularity ? scope.granularity : null,
      scope?.pointInTime ? scope.pointInTime : null,
      scope?.domainPurity ? scope.domainPurity : null,
    );

    this.form.valueChanges.subscribe(() => {
      this.save();
    });
  }

  save(): void {
    if (this.form.dirty) {
      this.dirtyFlagService.makeDirty();

      const granularity = this.form.getRawValue().granularity;
      const pointInTime = this.form.getRawValue().pointInTime;
      const domainPurity = this.form.getRawValue().domainPurity;

      const scope: Scope = {
        granularity: granularity ? granularity : undefined,
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
  }

  preventDefault(event: Event) {
    event.preventDefault();
  }

  GranularityGrainValues = [
    { value: Granularity_Grain.COARSE, viewValue: 'coarse' },
    { value: Granularity_Grain.MEDIUM, viewValue: 'medium' },
    { value: Granularity_Grain.FINE, viewValue: 'fine' },
  ];

  GranularityGoalValues = [
    { value: Granularity_Goal.CLOUD, viewValue: 'cloud' },
    { value: Granularity_Goal.KITE, viewValue: 'kite' },
    { value: Granularity_Goal.SEA, viewValue: 'sea' },
    { value: Granularity_Goal.FISH, viewValue: 'fish' },
    { value: Granularity_Goal.CLAM, viewValue: 'clam?' },
  ];

  PointInTimeValues = [
    { value: PointInTime.TO_BE, viewValue: 'to be' },
    { value: PointInTime.AS_IS, viewValue: 'as is' },
  ];

  DomainPurityValues = [
    { value: DomainPurity.PURE, viewValue: 'pure' },
    { value: DomainPurity.DIGITALIZED, viewValue: 'digitalized' },
  ];
}
