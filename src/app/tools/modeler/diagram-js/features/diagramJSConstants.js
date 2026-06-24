export const DS_REPLACE_PROVIDER = "ds-replace";

// Events
export const EVENT_CREATE_END = "create.end";
export const EVENT_PICKED_COLOR = "pickedColor";
export const EVENT_ELEMENTS_DELETE = "elements.delete";
export const EVENT_COPY_PASE_PASTE_ELEMENT = "copyPaste.pasteElement";
export const EVENT_COPY_PASE_PASTE_ELEMENTS = "copyPaste.pasteElements";
export const EVENT_SHAPE_MOVE_START = "shape.move.start"; // move existing shapes
export const EVENT_SHAPE_ADDED = "shape.added";
export const EVENT_SHAPE_REMOVE = "shape.remove";
export const EVENT_BENDPOINT_MOVE_START = "bendpoint.move.start"; // move and create bendpoints
export const EVENT_BENDPOINT_MOVE_END = "bendpoint.move.end"; // move and create bendpoints
export const EVENT_CONNECTION_SEGMENT_MOVE_START =
  "connectionSegment.move.start"; // move horizontal/vertical segments of connections
export const EVENT_ELEMENT_CLICK = "element.click"; // click on existing element (opens context pad if element is actor or work object)
export const EVENT_ELEMENT_DBLCLICK = "element.dblclick";
export const EVENT_ELEMENT_HOVER = "element.hover"; // show outline around element
export const EVENT_ELEMENT_CHANGED = "element.chagned";
export const EVENT_INTERACTION_EVENTS_CREATE_HIT =
  "interactionEvents.createHit"; // use palette to create new element
export const EVENT_SPACE_TOOL_SELECTION_START = "spaceTool.selection.start"; // use space tool
export const EVENT_LASSO_SELECTION_START = "lasso.selection.start"; // use lasso tool
export const EVENT_COMMANDSTACK_CHANGED = "commandStack.changed";
export const EVENT_DIAGRAM_CLEAR = "diagram.clear";

// Custom Events
export const ELEMENT_COLOR_CHANGE_EVENT = "element.colorChange";
export const ACTIVITY_DIRECTION_CHANGE_EVENT = "activity.directionChange";
export const ACTIVITY_CHANGED_EVENT = "activity.changed";
export const OPEN_COLOR_PICKER_EVENT = "openColorPicker";
export const DEFAULT_COLOR_EVENT = "defaultColor";
export const SHAPE_REMOVE_GROUP_WITHOUT_CHILDREN_EVENT =
  "shape.removeGroupWithoutChildren";
export const PROPERTY_COPY_CAN_COPY_PROPERTY_EVENT =
  "propertyCopy.canCopyProperty";
export const PROPERTY_COPY_CAN_COPY_PROPERTIES_EVENT =
  "propertyCopy.canCopyProperties";
export const PROPERTY_COPY_CAN_SET_COPIED_PROPERTY_EVENT =
  "propertyCopy.canSetCopiedProperty";

// CSS-Classes
export const OPEN_CONTEXT_PAD_CSS_CLASS = "djs-context-pad open";
export const LABEL_NUMBER_CSS_CLASS = "djs-labelNumber";
export const LABEL_CSS_CLASS = "djs-label";
