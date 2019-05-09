'use strict';

import { ACTIVITY, CONNECTION } from '../../language/elementTypes';

export function checkElementReferencesAndRepair(elements) {
  let activities = [];
  let objectIDs = [];

  let complete = true;

  elements.forEach(element => {
    let type = element.type;
    if (type == ACTIVITY || type == CONNECTION) {
      activities.push(element);
    } else {
      objectIDs.push(element.id);
    }
  });

  activities.forEach(activity => {
    let source = activity.source;
    let target = activity.target;
    if (!objectIDs.includes(source) || !objectIDs.includes(target)) {
      complete = false;
      let activityIndex = elements.indexOf(activity);
      elements = elements.splice(activityIndex,1);
    }
  });
  return complete;
}