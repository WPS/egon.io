import { FormControl, FormGroup } from '@angular/forms';

export interface TitleDialogForm {
  title: FormControl<string | null>;
  description: FormControl<string | null>;
}

export namespace TitleDialogForm {
  export function create(
    titel: string,
    description: string,
  ): FormGroup<TitleDialogForm> {
    return new FormGroup<TitleDialogForm>({
      title: new FormControl<string | null>(titel),
      description: new FormControl<string | null>(description),
    });
  }
}
