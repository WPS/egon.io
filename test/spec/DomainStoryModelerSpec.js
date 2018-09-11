import '../TestHelper';

import TestContainer from 'mocha-test-container-support';

import DomainStoryModeler from '../../app/domain-story-modeler';

describe('domainStory modeler', function() {

  var jsonString = '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:workObject","name":"","id":"shape_8681","x":508,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681"},'+
  '{"info":"test"}]';
  var data = JSON.parse(jsonString);
  // remove the info tag at the end before we load the data
  data.pop();

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  describe('domainStory import export', function() {

    // since PhantomJS does not implement ES6 features we have to define our own string.includes and string.endsWith methods
    if (!String.prototype.includes) {
      String.prototype.includes = function() {'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
          position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    var modeler;

    // spin up modeler with custom element, do this only once, using before each takes too long and triggers the timeout
    modeler = new DomainStoryModeler({ container: container });
    modeler.importCustomElements(data, function(err) {
      if (err) {
        console.log(err);
      }
    });

    it('should import domainStory element', function() {

      // given
      var elementRegistry = modeler.get('elementRegistry');
      var domainStoryElements = modeler.getCustomElements();
      // when

      modeler.importCustomElements(domainStoryElements);
      var actorPersonImport = elementRegistry.get('shape_3050');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
      expect(domainStoryElements[0].id).to.contain(actorPersonImport.id);

    });

    it('should export domainStory element', function() {

      // given
      var domainStoryElements = modeler.getCustomElements();

      modeler.importCustomElements(domainStoryElements);

      // when
      var newObject= domainStoryElements.slice(0);
      newObject.push({ info: 'test' });
      var jsonExport=JSON.stringify(newObject);

      // then
      expect(jsonExport).to.eql(jsonString);
    });

    // we have to rebuild the basic functionality of the import function from app.js, because we cannot get access to the HTML
    it('should not import wrong file type',function() {

      // given
      var testData='[{"type":"domainStory:actorPerson","name":"","id":"shape_0001","x":178,"y":133,"width":30,"height":30}]';
      var elementRegistry = modeler.get('elementRegistry');
      var input = {
        name:'thisIsAName.wrongF.dstiletype',
        testData
      };
      var reader = new FileReader();

      // when
      if (input.name.endsWith('.dst')) {
        reader.onloadend = function(e) {
          var text = e.target.result;

          var elements = JSON.parse(text);
          elements.pop(); // to get rid of the info tag at the end

          modeler.importCustomElements(elements);
        };

        reader.readAsText(input);
      }

      // then
      var extraActor= elementRegistry.get('shape_0001');
      expect(extraActor).to.not.exist;
    });
  });

});

describe('custom modeler', function() {

  var xml = require('./diagram.bpmn');

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('custom elements', function() {

    var modeler;

    // spin up modeler with custom element before each test
    beforeEach(function(done) {

      modeler = new DomainStoryModeler({ container: container });

      modeler.importXML(xml, function(err) {
        if (!err) {
          done();
        }
      });

    });


    it('should import custom element', function() {

      // given
      var elementRegistry = modeler.get('elementRegistry'),
          customElements = modeler.getCustomElements();


      // when
      var businessObject = {
        type: 'custom:triangle',
        id: 'CustomTriangle_1'
      };
      var customElement = {
        businessObject: businessObject,
        x: 300,
        y: 200,
        width: 10,
        height: 20 };

      modeler.addCustomElements([customElement]);
      var customTriangle = elementRegistry.get('CustomTriangle_1');

      // then
      // expect(is(customTriangle, 'custom:triangle')).to.be.true; // id checks for stuff that we cannot simulate without a more elaborate test-environement

      expect(customTriangle).to.exist;
      expect(customElements).to.contain(customElement);

    });

  });


  describe('custom connections', function() {

    var modeler;

    // spin up modeler with custom element before each test
    beforeEach(function(done) {
      modeler = new DomainStoryModeler({ container: container });

      modeler.importXML(xml, function(err) {
        if (!err) {
          modeler.addCustomElements([{
            type: 'custom:triangle',
            id: 'CustomTriangle_1',
            x: 300,
            y: 200,
            width: 100,
            height: 100
          }]);

          done();
        }
      });
    });


    it('should import custom connection', function() {

      // given
      var elementRegistry = modeler.get('elementRegistry');
      var customElements = modeler.getCustomElements();

      // when
      var customElement = {
        type: 'custom:connection',
        id: 'CustomConnection_1',
        source: 'CustomTriangle_1',
        target: 'Task_1',
        x: 100,
        y:100,
        width: 100,
        height: 100,
        waypoints: [
          { x: 100, y: 100 },
          { x: 200, y: 300 }
        ]
      };

      modeler.addCustomElements([customElement]);
      var customConnection = elementRegistry.get('CustomConnection_1');

      // then
      expect(customConnection).to.exist;
      expect(customElements).to.contain(customElement);

    });

  });

});