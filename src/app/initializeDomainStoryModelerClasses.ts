import { DirtyFlagService } from './domain/services/dirty-flag.service';
import { IconDictionaryService } from './tools/icon-set-config/services/icon-dictionary.service';
import { IconSetConfigurationService } from './tools/icon-set-config/services/icon-set-configuration.service';
import { ElementRegistryService } from './domain/services/element-registry.service';
import { LabelDictionaryService } from './tools/label-dictionary/services/label-dictionary.service';
import { initializeContextPadProvider } from './tools/modeler/bpmn/modeler/context-pad/domainStoryContextPadProvider';
import { initializePalette } from './tools/modeler/bpmn/modeler/palette/domainStoryPalette';
import { initializeRenderer } from './tools/modeler/bpmn/modeler/domainStoryRenderer';
import { initializeLabelEditingProvider } from './tools/modeler/bpmn/modeler/labeling/dsLabelEditingProvider';
import { initializeReplaceOptions } from './tools/modeler/bpmn/modeler/change-icon/replaceOptions';
import { initializeNumbering } from './tools/modeler/bpmn/modeler/numbering/numbering';
import { initializeActivityUpdateHandler } from './tools/modeler/bpmn/modeler/updateHandler/activityUpdateHandlers';

export function initializeDomainStoryModelerClasses(
  dirtyFlagService: DirtyFlagService,
  iconDictionaryService: IconDictionaryService,
  configurationService: IconSetConfigurationService,
  elementRegistryService: ElementRegistryService,
  labelDictionaryService: LabelDictionaryService,
) {
  return () => {
    initializeContextPadProvider(dirtyFlagService, iconDictionaryService);

    /** The Palette and the Context Menu need the Icons present in the Domain,
     * so the IconDictionaryService and the IconSetConfigurationService needs to be given to the Palette **/
    initializePalette(iconDictionaryService, configurationService);
    initializeRenderer(
      iconDictionaryService,
      elementRegistryService,
      dirtyFlagService,
    );
    initializeLabelEditingProvider(labelDictionaryService);
    initializeReplaceOptions(iconDictionaryService);
    initializeNumbering(elementRegistryService);
    initializeActivityUpdateHandler(elementRegistryService);
  };
}
