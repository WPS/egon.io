'use strict';

import ReplaceMenuProvider from './ReplaceMenuProvider';
import DSModeling from '../modeling/DSModeling';


export default {
  __depends__: [
  ],
  __init__: [ 'replaceMenuProvider' ],
  replaceMenuProvider: [ 'type', ReplaceMenuProvider ],
  modeling: [ 'type', DSModeling ],
};