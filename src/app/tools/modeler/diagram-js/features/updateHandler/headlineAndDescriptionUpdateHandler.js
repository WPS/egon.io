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
      ctx.oldTitle = propertiesService.title();
      ctx.oldDescription = propertiesService.description();
      ctx.oldScope = propertiesService.scope();

      propertiesService.updateTitleAndDescriptionAndScope(
        ctx.newTitle,
        ctx.newDescription,
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
