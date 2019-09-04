'user strict';

import { setTitleInputLast, setDescriptionInputLast } from '../../features/import/import';
import { changeWebsiteTitle } from '../../util/helpers';


const title = document.getElementById('title'),
      info = document.getElementById('info'),
      infoText = document.getElementById('infoText');

/**
 * a handler that updates the text of a BPMN element.
 */
export default function headlineAndDescriptionUpdateHandler(commandStack) {

  commandStack.registerHandler('story.updateHeadlineAndDescription',handlerFunction);

  function handlerFunction() {

    this.execute = function(ctx) {

      let inputTitle = ctx.newTitle;
      let inputText = ctx.newDescription;

      title.innerText = inputTitle;
      info.innerText = inputText;
      infoText.innerText = inputText;

      setTitleInputLast(inputTitle);
      setDescriptionInputLast(inputText);
      changeWebsiteTitle(inputTitle);
    };

    this.revert = function(ctx) {

      let inputTitle = ctx.oldTitle;
      let inputText = ctx.oldDescription;

      title.innerText = inputTitle;
      info.innerText = inputText;
      infoText.innerText = inputText;

      setTitleInputLast(inputTitle);
      setDescriptionInputLast(inputText);
      changeWebsiteTitle(inputTitle);
    };
  }
}