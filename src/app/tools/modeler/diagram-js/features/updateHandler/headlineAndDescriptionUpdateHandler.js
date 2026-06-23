import { sanitizeTextForSVGExport } from "src/app/utils/sanitizer";

export default function headlineAndDescriptionUpdateHandler(
  commandStack,
  propertiesService,
) {
  commandStack.registerHandler(
    "story.updateHeadlineAndDescriptionAndScope",
    handlerFunction,
  );

  function handlerFunction() {
    this.execute = function (ctx) {
      ctx.oldTitle = propertiesService.getTitle();
      ctx.oldDescription = propertiesService.getDescription();
      ctx.oldScope = propertiesService.getScope();

      propertiesService.updateTitleAndDescriptionAndScope(
        sanitizeTextForSVGExport(ctx.newTitle),
        sanitizeTextForSVGExport(ctx.newDescription),
        ctx.newScope,
        false,
      );
    };

    this.revert = function (ctx) {
      propertiesService.updateTitleAndDescriptionAndScope(
        ctx.oldTitle,
        ctx.oldDescription,
        ctx.oldScope,
        false,
      );
    };
  }
}
