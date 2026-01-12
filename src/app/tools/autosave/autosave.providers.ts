import { inject, provideAppInitializer } from '@angular/core';
import { AutosaveService }               from './services/autosave.service';

export function provideAutosave() {
  return provideAppInitializer(() => {
    inject(AutosaveService);
  });
}
