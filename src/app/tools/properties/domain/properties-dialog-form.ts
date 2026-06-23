import { FormControl, FormGroup } from '@angular/forms';
import { DomainPurity, PointInTime } from 'src/app/domain/entities/scope';

export interface PropertiesDialogForm {
  title: FormControl<string | null>;
  description: FormControl<string | null>;
  granularity: FormControl<string | null>;
  pointInTime: FormControl<PointInTime | null>;
  domainPurity: FormControl<DomainPurity | null>;
}

export namespace PropertiesDialogForm {
  export function create(
    title: string,
    description: string,
    granularity: string,
    pointInTime: PointInTime | null,
    domainPurity: DomainPurity | null,
  ): FormGroup<PropertiesDialogForm> {
    return new FormGroup<PropertiesDialogForm>({
      title: new FormControl<string | null>(title),
      description: new FormControl<string | null>(description),
      granularity: new FormControl<string | null>(granularity),
      pointInTime: new FormControl<PointInTime | null>(pointInTime),
      domainPurity: new FormControl<DomainPurity | null>(domainPurity),
    });
  }
}
