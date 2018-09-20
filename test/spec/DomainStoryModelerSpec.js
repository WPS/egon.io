import TestContainer from 'mocha-test-container-support';

import DomainStoryModeler from '../../app/domain-story-modeler';

describe('domainStory modeler', function() {

  var jsonString = '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:workObject","name":"","id":"shape_8681","x":508,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681"},'+
  '{"info":"test"}]';

  var intricateJsonString = '[{"type":"domainStory:group","name":"ein gruppenname","id":"shape_9638","x":751,"y":330,"height":275,"width":525},'+
  '{"type":"domainStory:actorPerson","name":"ein actor name","id":"shape_6458","x":547,"y":223},'+
  '{"type":"domainStory:workObject","name":"","id":"shape_8970","x":681,"y":223},'+
  '{"type":"domainStory:actorSystem","name":"","id":"shape_8118","x":976,"y":223},'+
  '{"type":"domainStory:workObject","name":"","id":"shape_9327","x":987,"y":346},'+
  '{"type":"domainStory:workObject","name":"ein workobject name","id":"shape_5439","x":681,"y":371},'+
  '{"type":"domainStory:workObjectCall","name":"","id":"shape_5296","x":681,"y":506},'+
  '{"type":"domainStory:workObject","name":"","id":"shape_8808","x":1193,"y":506},'+
  '{"type":"domainStory:actorPerson","name":"","id":"shape_3974","x":987,"y":506},'+
  '{"type":"domainStory:activity","name":"ein labeltext","id":"connection_6847","waypoints":[{"original":{"x":585,"y":261},"x":628,"y":261},{"original":{"x":719,"y":261},"x":681,"y":261}],"source":"shape_6458","target":"shape_8970","number":1},'+
  '{"type":"domainStory:activity","name":"","id":"connection_0720","waypoints":[{"original":{"x":719,"y":261},"x":762,"y":261},{"original":{"x":1014,"y":261},"x":976,"y":261}],"source":"shape_8970","target":"shape_8118"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_9638","waypoints":[{"original":{"x":1014,"y":261},"x":1018,"y":308},{"original":{"x":1025,"y":384},"x":1022,"y":346}],"source":"shape_8118","target":"shape_9327","number":2},'+
  '{"type":"domainStory:activity","name":"","id":"connection_8306","waypoints":[{"original":{"x":719,"y":261},"x":719,"y":308},{"original":{"x":719,"y":409},"x":719,"y":371}],"source":"shape_8970","target":"shape_5439"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_6550","waypoints":[{"original":{"x":719,"y":409},"x":719,"y":456},{"original":{"x":719,"y":544},"x":719,"y":506}],"source":"shape_5439","target":"shape_5296"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_0196","waypoints":[{"original":{"x":1025,"y":384},"x":1025,"y":431},{"original":{"x":1025,"y":544},"x":1025,"y":506}],"source":"shape_9327","target":"shape_3974"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_2991","waypoints":[{"original":{"x":1025,"y":544},"x":1072,"y":548},{"original":{"x":1226,"y":563},"x":1193,"y":560}],"source":"shape_3974","target":"shape_8808","number":3},'+
  '{"type":"domainStory:activity","name":"","id":"connection_9263","waypoints":[{"original":{"x":719,"y":544},"x":764,"y":547},{"original":{"x":1005,"y":560},"x":987,"y":559}],"source":"shape_5296","target":"shape_3974"},'+
  '{"type":"domainStory:textAnnotation","name":"","id":"shape_5750","x":1106,"y":382,"text":"ein weiteres kommentar","number":42},'+
  '{"type":"domainStory:connection","name":"","id":"connection_6966","waypoints":[{"original":{"x":1025,"y":544},"x":1045,"y":522},{"original":{"x":1156,"y":397},"x":1143,"y":412}],"source":"shape_3974","target":"shape_5750"},'+
  '{"type":"domainStory:textAnnotation","name":"","id":"shape_3367","x":1109,"y":201,"text":"ein kommentar","number":30},'+
  '{"type":"domainStory:connection","name":"","id":"connection_0733","waypoints":[{"original":{"x":1014,"y":261},"x":1046,"y":251},{"original":{"x":1159,"y":216},"x":1111,"y":231}],"source":"shape_8118","target":"shape_3367"},'+
  '{"info":"Eine Beschreibung"}]';

  var data = JSON.parse(jsonString);
  var intricateData=JSON.parse(intricateJsonString);
  // remove the info tag at the end before we load the data
  data.pop();
  intricateData.pop();

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  describe('domainStory import export Test simple data', function() {

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

  describe('domainStory import export Test intricate data', function() {

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
    modeler.importCustomElements(intricateData, function(err) {
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
      var actorPersonImport = elementRegistry.get('shape_6458');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
    });

    it('should export domainStory element', function() {

    // given
      var domainStoryElements = modeler.getCustomElements();

      modeler.importCustomElements(domainStoryElements);

      // when
      var newObject = domainStoryElements.slice(0);
      newObject.push({ info: 'Eine Beschreibung' });
      var jsonExport = '' + JSON.stringify(newObject);

      // then
      // expect(jsonExport).to.eql(jsonString);
      var jsonLength = jsonExport.length;
      var jsonElements = [];

      var index = jsonExport.indexOf('}')+1;
      while (index > 0) {
        var substring = jsonExport.slice(1, index);
        jsonElements.push(substring);
        jsonExport = jsonExport.slice(index);
        index= jsonExport.indexOf('}')+1;
      }

      expect(intricateJsonString.length).to.eql(jsonLength);

      jsonElements.forEach(element =>{
        expect(intricateJsonString.includes(element)).to.be.true;
      });
    });
  });
});