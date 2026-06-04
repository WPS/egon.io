import { FormControl, FormGroup } from '@angular/forms';
import {
  DomainPurity,
  Granularity,
  PointInTime,
  Scope,
} from 'src/app/domain/entities/scope';

export interface TitleDialogForm {
  title: FormControl<string | null>;
  description: FormControl<string | null>;
  granularity: FormControl<Granularity | null>;
  pointInTime: FormControl<PointInTime | null>;
  domainPurity: FormControl<DomainPurity | null>;
}

export namespace TitleDialogForm {
  export function create(
    titel: string,
    description: string,
    granularity: Granularity | null,
    pointInTime: PointInTime | null,
    domainPurity: DomainPurity | null,
  ): FormGroup<TitleDialogForm> {
    return new FormGroup<TitleDialogForm>({
      title: new FormControl<string | null>(titel),
      description: new FormControl<string | null>(description),
      granularity: new FormControl<Granularity | null>(granularity),
      pointInTime: new FormControl<PointInTime | null>(pointInTime),
      domainPurity: new FormControl<DomainPurity | null>(domainPurity),
    });
  }
}
