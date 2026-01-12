import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckboxDefaultOptions,
} from '@angular/material/checkbox';
import { UntypedFormBuilder } from '@angular/forms';

import { provideModeler } from './tools/modeler/modeler.providers';
import { provideAutosave } from './tools/autosave/autosave.providers';
import { provideImportDomainStory } from './tools/import/import.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    UntypedFormBuilder,
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: { clickAction: 'noop' } as MatCheckboxDefaultOptions,
    },
    provideModeler(),
    provideAutosave(),
    provideImportDomainStory(),
  ],
};
