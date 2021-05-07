import TestContainer from 'mocha-test-container-support';

import DomainStoryModeler from '../../../app/domain-story-modeler';
import { default_conf } from '../../../app/domain-story-modeler/language/icon/iconConfig';
import { readerFunction } from '../../../app/domain-story-modeler/features/import/import';
import {
  checkElementReferencesAndRepair,
  updateCustomElementsPreviousv050
} from '../../../app/domain-story-modeler/features/import/ImportRepair';
import { initTypeDictionaries } from '../../../app/domain-story-modeler/language/icon/dictionaries';
import {
  setElementregistry,
  getElementRegistry
} from '../../../app/domain-story-modeler/language/canvasElementRegistry';

import { DST_TYPE } from '../../../app/domain-story-modeler/features/import/import';

import { jsonString, jsonString2, brokenJsonString, oldIntricateV_0_2_0_JsonString, oldIntricateV_0_3_0_JsonString, intricateV0_5_0_JsonString, intricateV0_6_0_JSONString, intricateConfig } from './dstJsons';

const sinon = require('sinon');

setElementregistry(sinon.mock(getElementRegistry()));

describe('domainStory modeler', function() {

  let data = JSON.parse(jsonString);
  let brokenData = JSON.parse(brokenJsonString);
  let oldIntricateV_0_2_0_Data = JSON.parse(oldIntricateV_0_2_0_JsonString);
  let oldIntricateV_0_3_0_Data = JSON.parse(oldIntricateV_0_3_0_JsonString);
  let oldIntricateV0_5_0_Data = JSON.parse(intricateV0_5_0_JsonString);

  // remove the info tag at the end before we load the data
  data.pop();
  brokenData.pop();
  oldIntricateV0_5_0_Data.pop();
  oldIntricateV_0_2_0_Data.pop();
  oldIntricateV_0_3_0_Data.pop();
  oldIntricateV0_5_0_Data.pop();

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  describe('domainStory import export Test simple data', function() {
    initTypeDictionaries(default_conf.actors, default_conf.workObjects);

    // since PhantomJS does not implement ES6 features we have to define our own string.includes and string.endsWith methods
    if (!String.prototype.includes) {
      String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
        const subjectString = this.toString();
        if (
          typeof position !== 'number' ||
          !isFinite(position) ||
          Math.floor(position) !== position ||
          position > subjectString.length
        ) {
          position = subjectString.length;
        }
        position -= searchString.length;
        const lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    let modeler;

    // spin up modeler with custom element, do this only once, using before each takes too long and triggers the timeout
    modeler = new DomainStoryModeler({ container: container });
    modeler.importCustomElements(data, function(err) {
      if (err) {
        console.log(err);
      }
    });

    it('should import domainStory element', function() {

      // given
      let elementRegistry = modeler.get('elementRegistry');
      let domainStoryElements = modeler.getCustomElements();

      // when

      modeler.importCustomElements(domainStoryElements);
      const actorPersonImport = elementRegistry.get('shape_3050');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
      expect(domainStoryElements[0].id).to.contain(actorPersonImport.id);
    });

    it('should export domainStory element', function() {

      // given
      let domainStoryElements = modeler.getCustomElements();

      modeler.importCustomElements(domainStoryElements);

      // when
      let newObject = domainStoryElements.slice(0);
      newObject.push({ info: 'test' });
      const jsonExport = JSON.stringify(newObject);

      // then
      expect(jsonExport).to.eql(jsonString);
    });

    // we have to rebuild the basic functionality of the import function from app.js, because we cannot get access to the HTML
    it('should not import wrong file type', function() {

      // given
      const testData =
        '[{"type":"domainStory:actorPerson","name":"","id":"shape_0001","x":178,"y":133,"width":30,"height":30}]';
      let elementRegistry = modeler.get('elementRegistry');
      const input = {
        name: 'thisIsAName.wrongF.dstiletype',
        testData
      };
      const reader = new FileReader();

      // when
      if (input.name.endsWith('.dst')) {
        reader.onloadend = function(e) {
          let text = e.target.result;

          let elements = JSON.parse(text);
          elements.pop(); // to get rid of the info tag at the end

          modeler.importCustomElements(elements);
        };

        reader.readAsText(input);
      }

      // then
      const extraActor = elementRegistry.get('shape_0001');
      expect(extraActor).to.not.exist;
    });
  });

  describe('domainStory import export Test broken data', function() {
    initTypeDictionaries(default_conf.actors, default_conf.workObjects);

    // since PhantomJS does not implement ES6 features we have to define our own string.includes and string.endsWith methods
    if (!String.prototype.includes) {
      String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
        const subjectString = this.toString();
        if (
          typeof position !== 'number' ||
          !isFinite(position) ||
          Math.floor(position) !== position ||
          position > subjectString.length
        ) {
          position = subjectString.length;
        }
        position -= searchString.length;
        const lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }
    if (!Array.prototype.includes) {
      Object.defineProperty(Array.prototype, 'includes', {
        value: function(searchElement, fromIndex) {
          if (this == null) {
            throw new TypeError('"this" is null or not defined');
          }
          const o = Object(this);
          // eslint-disable-next-line no-bitwise
          const len = o.length >>> 0;

          if (len === 0) {
            return false;
          }
          // eslint-disable-next-line no-bitwise
          const n = fromIndex | 0;
          let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

          function sameValueZero(x, y) {
            return (
              x === y ||
              (typeof x === 'number' &&
                typeof y === 'number' &&
                isNaN(x) &&
                isNaN(y))
            );
          }
          while (k < len) {
            if (sameValueZero(o[k], searchElement)) {
              return true;
            }
            k++;
          }
          return false;
        }
      });
    }

    let modeler;

    // spin up modeler with custom element, do this only once, using before each takes too long and triggers the timeout
    modeler = new DomainStoryModeler({ container: container });
    checkElementReferencesAndRepair(brokenData);
    modeler.importCustomElements(brokenData, function(err) {
      if (err) {
        console.log(err);
      }
    });

    it('should import domainStory element', function() {

      // given
      let elementRegistry = modeler.get('elementRegistry');
      let domainStoryElements = modeler.getCustomElements();

      // when

      modeler.importCustomElements(domainStoryElements);
      const actorPersonImport = elementRegistry.get('connection_3004');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
      expect(domainStoryElements[2].id).to.contain(actorPersonImport.id);
    });

    it('should export domainStory element', function() {

      // given
      let domainStoryElements = modeler.getCustomElements();

      modeler.importCustomElements(domainStoryElements);

      // when
      let newObject = domainStoryElements.slice(0);
      newObject.push({ info: 'test' });
      const jsonExport = JSON.stringify(newObject);

      // then
      expect(jsonExport).to.eql(jsonString2);
    });
  });

  describe('domainStory import Test old intricate data V_0_2_0', function() {

    // since PhantomJS does not implement ES6 features we have to define our own string.includes and string.endsWith methods
    if (!String.prototype.includes) {
      String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
        const subjectString = this.toString();
        if (
          typeof position !== 'number' ||
          !isFinite(position) ||
          Math.floor(position) !== position ||
          position > subjectString.length
        ) {
          position = subjectString.length;
        }
        position -= searchString.length;
        const lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    let modeler;

    // spin up modeler with custom element, do this only once, using before each takes too long and triggers the timeout
    modeler = new DomainStoryModeler({ container: container });
    oldIntricateV_0_2_0_Data = updateCustomElementsPreviousv050(
      oldIntricateV_0_2_0_Data
    );
    modeler.importCustomElements(oldIntricateV_0_2_0_Data, function(err) {
      if (err) {
        console.log(err);
      }
    });

    it('should import domainStory element', function() {

      // given
      let elementRegistry = modeler.get('elementRegistry');
      let domainStoryElements = modeler.getCustomElements();

      // when

      modeler.importCustomElements(domainStoryElements);
      const actorPersonImport = elementRegistry.get('shape_6458');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
    });
  });

  describe('domainStory import Test old intricate data V_0_3_0', function() {

    // since PhantomJS does not implement ES6 features we have to define our own string.includes and string.endsWith methods
    if (!String.prototype.includes) {
      String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
        const subjectString = this.toString();
        if (
          typeof position !== 'number' ||
          !isFinite(position) ||
          Math.floor(position) !== position ||
          position > subjectString.length
        ) {
          position = subjectString.length;
        }
        position -= searchString.length;
        const lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    let modeler;

    // spin up modeler with custom element, do this only once, using before each takes too long and triggers the timeout
    modeler = new DomainStoryModeler({ container: container });
    const updatedData = updateCustomElementsPreviousv050(
      oldIntricateV_0_3_0_Data
    );
    modeler.importCustomElements(updatedData, function(err) {
      if (err) {
        console.log(err);
      }
    });

    it('should import domainStory element', function() {

      // given
      let elementRegistry = modeler.get('elementRegistry');
      let domainStoryElements = modeler.getCustomElements();

      // when

      modeler.importCustomElements(domainStoryElements);
      const actorPersonImport = elementRegistry.get('shape_8808');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
    });
  });

  describe('domainStory import export Test intricate data V_0_5_0', function() {

    // since PhantomJS does not implement ES6 features we have to define our own string.includes and string.endsWith methods
    if (!String.prototype.includes) {
      String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
        const subjectString = this.toString();
        if (
          typeof position !== 'number' ||
          !isFinite(position) ||
          Math.floor(position) !== position ||
          position > subjectString.length
        ) {
          position = subjectString.length;
        }
        position -= searchString.length;
        const lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    let modeler;

    // spin up modeler with custom element, do this only once, using before each takes too long and triggers the timeout
    modeler = new DomainStoryModeler({ container: container });
    modeler.importCustomElements(oldIntricateV0_5_0_Data, function(err) {
      if (err) {
        console.log(err);
      }
    });

    it('should import domainStory element', function() {

      // given
      let elementRegistry = modeler.get('elementRegistry');
      let domainStoryElements = modeler.getCustomElements();

      // when

      modeler.importCustomElements(domainStoryElements);
      const actorPersonImport = elementRegistry.get('shape_3387');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
    });

    it('should export domainStory element', function() {

      // given
      let domainStoryElements = modeler.getCustomElements();

      modeler.importCustomElements(domainStoryElements);

      // when
      let newObject = domainStoryElements.slice(0);

      newObject.push({
        info: 'Assumption: no line at box office, seats available, cash payment'
      });
      newObject.push({ version: '0.5.0' });
      let jsonExport = '' + JSON.stringify(newObject);

      // then
      let jsonElements = [];

      let index = jsonExport.indexOf('}') + 1;
      while (index > 0) {
        let substring = jsonExport.slice(1, index);
        jsonElements.push(substring);
        jsonExport = jsonExport.slice(index);
        index = jsonExport.indexOf('}') + 1;
      }

      jsonElements.forEach(element => {
        if (element.includes('id')) {
          let id = element.substring(
            element.indexOf('id'),
            element.indexOf('id') + 15
          );
          expect(intricateV0_5_0_JsonString.includes(id)).to.be.true;
        }
      });
    });
  });

  describe('domainStory import export Test intricate data V_0_6_0', function() {

    // since PhantomJS does not implement ES6 features we have to define our own string.includes and string.endsWith methods
    if (!String.prototype.includes) {
      String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
        const subjectString = this.toString();
        if (
          typeof position !== 'number' ||
          !isFinite(position) ||
          Math.floor(position) !== position ||
          position > subjectString.length
        ) {
          position = subjectString.length;
        }
        position -= searchString.length;
        const lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    let modeler;

    // spin up modeler with custom element, do this only once, using before each takes too long and triggers the timeout
    modeler = new DomainStoryModeler({ container: container });

    const intricateV0_6_0_JSONStringWithCustomConfig = JSON.stringify({
      domain: JSON.stringify(intricateConfig),
      dst: intricateV0_6_0_JSONString
    });

    readerFunction(intricateV0_6_0_JSONStringWithCustomConfig, null, modeler, DST_TYPE);

    it('should import domainStory element', function() {

      // given
      let elementRegistry = modeler.get('elementRegistry');
      let domainStoryElements = modeler.getCustomElements();

      // when

      modeler.importCustomElements(domainStoryElements);
      const actorPersonImport = elementRegistry.get('shape_3387');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
    });

    it('should export domainStory element', function() {

      // given
      let domainStoryElements = modeler.getCustomElements();

      modeler.importCustomElements(domainStoryElements);

      // when
      let newObject = domainStoryElements.slice(0);

      newObject.push({
        info: 'Assumption: no line at box office, seats available, cash payment'
      });
      newObject.push({ version: '0.5.0' });
      let jsonExport = '' + JSON.stringify(newObject);

      // then
      let jsonElements = [];

      let index = jsonExport.indexOf('}') + 1;
      while (index > 0) {
        let substring = jsonExport.slice(1, index);
        jsonElements.push(substring);
        jsonExport = jsonExport.slice(index);
        index = jsonExport.indexOf('}') + 1;
      }

      jsonElements.forEach(element => {
        if (element.includes('id')) {
          let id = element.substring(
            element.indexOf('id'),
            element.indexOf('id') + 15
          );
          expect(intricateV0_6_0_JSONString.includes(id)).to.be.true;
        }
      });
    });
  });
});