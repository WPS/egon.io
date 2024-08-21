export default function headlineAndDescriptionUpdateHandler(
  commandStack,
  titleService,
) {
  commandStack.registerHandler(
    "story.updateHeadlineAndDescription",
    handlerFunction,
  );

  function handlerFunction() {
    this.execute = function (ctx) {
      ctx.oldTitle = titleService.getTitle();
      ctx.oldDescription = titleService.getDescription();

      titleService.updateTitleAndDescription(
        ctx.newTitle,
        ctx.newDescription,
        false,
      );
    };

    this.revert = function (ctx) {
      titleService.updateTitleAndDescription(
        ctx.oldTitle,
        ctx.oldDescription,
        false,
      );
    };
  }
}
