import { FormControl, FormGroup } from '@angular/forms';
import {
  DomainPurity,
  Granularity_Goal,
  Granularity_Grain,
  PointInTime,
} from 'src/app/domain/entities/scope';

export interface PropertiesForm {
  title: FormControl<string | null>;
  description: FormControl<string | null>;
  granularity: FormControl<Granularity_Goal | Granularity_Grain | null>;
  pointInTime: FormControl<PointInTime | null>;
  domainPurity: FormControl<DomainPurity | null>;
}

export namespace PropertiesForm {
  export function create(
    title: string,
    description: string,
    granularity: Granularity_Goal | Granularity_Grain | null,
    pointInTime: PointInTime | null,
    domainPurity: DomainPurity | null,
  ): FormGroup<PropertiesForm> {
    return new FormGroup<PropertiesForm>({
      title: new FormControl<string | null>(title),
      description: new FormControl<string | null>(description),
      granularity: new FormControl<Granularity_Goal | Granularity_Grain | null>(
        granularity,
      ),
      pointInTime: new FormControl<PointInTime | null>(pointInTime),
      domainPurity: new FormControl<DomainPurity | null>(domainPurity),
    });
  }
}
