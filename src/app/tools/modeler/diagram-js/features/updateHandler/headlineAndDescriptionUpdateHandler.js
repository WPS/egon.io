import { sanitizeTextForSVGExport } from "src/app/utils/sanitizer";

export default function headlineAndDescriptionUpdateHandler(
  commandStack,
  titleService,
) {
  commandStack.registerHandler(
    "story.updateHeadlineAndDescriptionAndScope",
    handlerFunction,
  );

  function handlerFunction() {
    this.execute = function (ctx) {
      ctx.oldTitle = titleService.getTitle();
      ctx.oldDescription = titleService.getDescription();
      ctx.oldScope = titleService.getScope();

      titleService.updateTitleAndDescriptionAndScope(
        sanitizeTextForSVGExport(ctx.newTitle),
        sanitizeTextForSVGExport(ctx.newDescription),
        ctx.newScope,
        false,
      );
    };

    this.revert = function (ctx) {
      titleService.updateTitleAndDescription(
        ctx.oldTitle,
        ctx.oldDescription,
        ctx.oldScope,
        false,
      );
    };
  }
}
