import { FormControl, FormGroup, Validators } from '@angular/forms';

export interface ActivityDialogForm {
  activityLabel: FormControl<string>;
  activityNumber: FormControl<number | null>;
  multipleNumbers: FormControl<boolean>;
}

export namespace ActivityDialogForm {
  export function create(
    activityLabel: string,
    activityNumber: number | null,
    numberIsAllowedMultipleTimes: boolean,
  ): FormGroup<ActivityDialogForm> {
    return new FormGroup<ActivityDialogForm>({
      activityLabel: new FormControl<string>(activityLabel, {
        nonNullable: true,
      }),
      activityNumber: new FormControl<number | null>(activityNumber, [
        Validators.required,
      ]),
      multipleNumbers: new FormControl<boolean>(numberIsAllowedMultipleTimes, {
        nonNullable: true,
      }),
    });
  }
}
