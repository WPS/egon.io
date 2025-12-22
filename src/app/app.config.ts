import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckboxDefaultOptions,
} from '@angular/material/checkbox';
import { UntypedFormBuilder } from '@angular/forms';

import { DirtyFlagService } from './domain/services/dirty-flag.service';
import { IconDictionaryService } from './tools/icon-set-config/services/icon-dictionary.service';
import { ElementRegistryService } from './domain/services/element-registry.service';
import { LabelDictionaryService } from './tools/label-dictionary/services/label-dictionary.service';
import { ImportDomainStoryService } from './tools/import/services/import-domain-story.service';
import { IconSetChangedService } from './tools/icon-set-config/services/icon-set-customization.service';
import { AutosaveService } from './tools/autosave/services/autosave.service';

import { initializeContextPadProvider } from './tools/modeler/diagram-js/features/context-pad/domainStoryContextPadProvider';
import { initializePalette } from './tools/modeler/diagram-js/features/palette/domainStoryPalette';
import { initializeRenderer } from './tools/modeler/diagram-js/features/domainStoryRenderer';
import { initializeLabelEditingProvider } from './tools/modeler/diagram-js/features/labeling/dsLabelEditingProvider';
import { initializeReplaceOptions } from './tools/modeler/diagram-js/features/change-icon/replaceOptions';
import { initializeNumbering } from './tools/modeler/diagram-js/features/numbering/numbering';
import { initializeActivityUpdateHandler } from './tools/modeler/diagram-js/features/updateHandler/activityUpdateHandlers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    UntypedFormBuilder,
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: { clickAction: 'noop' } as MatCheckboxDefaultOptions,
    },
    provideAppInitializer(() => {
      const dirtyFlagService = inject(DirtyFlagService);
      const iconDictionaryService = inject(IconDictionaryService);
      const elementRegistryService = inject(ElementRegistryService);
      const labelDictionaryService = inject(LabelDictionaryService);

      initializeContextPadProvider(dirtyFlagService, iconDictionaryService);
      initializePalette(iconDictionaryService);
      initializeRenderer(
        iconDictionaryService,
        elementRegistryService,
        dirtyFlagService,
      );
      initializeLabelEditingProvider(labelDictionaryService);
      initializeReplaceOptions(iconDictionaryService);
      initializeNumbering(elementRegistryService);
      initializeActivityUpdateHandler(elementRegistryService);
    }),
    provideAppInitializer(() => {
      inject(AutosaveService);
    }),
    {
      provide: IconSetChangedService,
      useExisting: ImportDomainStoryService,
    },
  ],
};
