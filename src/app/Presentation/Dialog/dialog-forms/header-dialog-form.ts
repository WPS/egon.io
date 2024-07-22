import { FormControl, FormGroup } from '@angular/forms';

export interface HeaderDialogForm {
  title: FormControl<string | null>;
  description: FormControl<string | null>;
}

export namespace HeaderDialogForm {
  export function create(
    titel: string,
    description: string,
  ): FormGroup<HeaderDialogForm> {
    return new FormGroup<HeaderDialogForm>({
      title: new FormControl<string | null>(titel),
      description: new FormControl<string | null>(description),
    });
  }
}
