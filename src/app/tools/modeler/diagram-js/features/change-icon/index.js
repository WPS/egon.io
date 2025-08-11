'use strict';

import ReplaceMenuProvider from './replaceMenuProvider';
import DSModeling from '../modeling/dSModeling';

export default {
  __depends__: [],
  __init__: ['replaceMenuProvider'],
  replaceMenuProvider: ['type', ReplaceMenuProvider],
  modeling: ['type', DSModeling],
};
