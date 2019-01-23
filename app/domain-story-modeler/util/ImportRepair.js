'use strict';

import { ACTIVITY, CONNECTION } from '../language/elementTypes';

export function checkElementReferencesAndRepair(elements) {
  var activities = [];
  var objectIDs = [];

  var complete = true;

  elements.forEach(element => {
    var type = element.type;
    if (type == ACTIVITY || type == CONNECTION) {
      activities.push(element);
    } else {
      objectIDs.push(element.id);
    }
  });

  activities.forEach(activity => {
    var source = activity.source;
    var target = activity.target;
    if (!objectIDs.includes(source) || !objectIDs.includes(target)) {
      complete = false;
      var activityIndex = elements.indexOf(activity);
      elements = elements.splice(activityIndex,1);
    }
  });
  return complete;
}