import { inject, provideAppInitializer } from '@angular/core';
import { DirtyFlagService } from '../../domain/services/dirty-flag.service';
import { IconDictionaryService } from '../icon-set-config/services/icon-dictionary.service';
import { ElementRegistryService } from '../../domain/services/element-registry.service';
import { LabelDictionaryService } from '../label-dictionary/services/label-dictionary.service';
import { initializeContextPadProvider } from './diagram-js/features/context-pad/domainStoryContextPadProvider';
import { initializePalette } from './diagram-js/features/palette/domainStoryPalette';
import { initializeRenderer } from './diagram-js/features/domainStoryRenderer';
import { initializeLabelEditingProvider } from './diagram-js/features/labeling/dsLabelEditingProvider';
import { initializeReplaceOptions } from './diagram-js/features/change-icon/replaceOptions';
import { initializeNumbering } from './diagram-js/features/numbering/numbering';
import { initializeActivityUpdateHandler } from './diagram-js/features/updateHandler/activityUpdateHandlers';

export function provideModeler() {
  return provideAppInitializer(() => {
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
  });
}
