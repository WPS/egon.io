import CopyPasteModule from "diagram-js/lib/features/copy-paste";

import EgonCopyPaste from "./EgonCopyPaste";
import PropertyCopy from "./PropertyCopy";

export default {
  __depends__: [CopyPasteModule],
  __init__: ["egonCopyPaste", "propertyCopy"],
  egonCopyPaste: ["type", EgonCopyPaste],
  propertyCopy: ["type", PropertyCopy],
};
