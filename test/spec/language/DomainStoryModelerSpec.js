import TestContainer from 'mocha-test-container-support';

import DomainStoryModeler from '../../../app/domain-story-modeler';
import { default_conf } from '../../../app/domain-story-modeler/language/icon/iconConfig';
import { checkElementReferencesAndRepair } from '../../../app/domain-story-modeler/util/ImportRepair';
import { initActorIconDictionary } from '../../../app/domain-story-modeler/language/actorIconDictionary';
import { initWorkObjectIconDictionary } from '../../../app/domain-story-modeler/language/workObjectIconDictionary';
import { updateCustomElementsPreviousv050 } from '../../../app/domain-story-modeler/features/import/import';
import { isTestMode } from '../../../app/domain-story-modeler/language/testmode';

isTestMode();

describe('domainStory modeler', function() {

  var jsonString = '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:workObjectDocument","name":"","id":"shape_8681","x":508,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681"},'+
  '{"info":"test"}]';

  var brokenJsonString = '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:workObjectDocument","name":"","id":"shape_8681","x":508,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:activity","name":"","id":"connection_0001","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_0001","target":"shape_0002"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681"},'+
  '{"info":"test"}]';

  var oldIntricateV_0_2_0_JsonString = '[{"type":"domainStory:group","name":"ein gruppenname","id":"shape_9638","x":751,"y":330,"height":275,"width":525},'+
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


  var oldIntricateV_0_3_0_JsonString = '[{"type":"domainStory:group","name":"ein gruppenname","id":"shape_9638","x":751,"y":330,"height":275,"width":525},'+
  '{"type":"domainStory:actorPerson","name":"ein actor name","id":"shape_6458","x":547,"y":223},'+
  '{"type":"domainStory:workObject","name":"","id":"shape_8970","x":681,"y":223},'+
  '{"type":"domainStory:actorSystem","name":"","id":"shape_8118","x":976,"y":223},'+
  '{"type":"domainStory:workObject","name":"","id":"shape_9327","x":987,"y":346},'+
  '{"type":"domainStory:workObject","name":"ein workobject name","id":"shape_5439","x":681,"y":371},'+
  '{"type":"domainStory:workObjectCall","name":"","id":"shape_5296","x":681,"y":506},'+
  '{"type":"domainStory:workObject","name":"","id":"shape_8808","x":1193,"y":506},'+
  '{"type":"domainStory:actorPerson","name":"","id":"shape_3974","x":987,"y":506},'+
  '{"type":"domainStory:textAnnotation","name":"","id":"shape_5750","x":1106,"y":382,"text":"ein weiteres kommentar","number":42},'+
  '{"type":"domainStory:textAnnotation","name":"","id":"shape_3367","x":1109,"y":201,"text":"ein kommentar","number":30},'+
  '{"type":"domainStory:activity","name":"ein labeltext","id":"connection_6847","waypoints":[{"original":{"x":585,"y":261},"x":628,"y":261},{"original":{"x":719,"y":261},"x":681,"y":261}],"source":"shape_6458","target":"shape_8970","number":1},'+
  '{"type":"domainStory:activity","name":"","id":"connection_0720","waypoints":[{"original":{"x":719,"y":261},"x":762,"y":261},{"original":{"x":1014,"y":261},"x":976,"y":261}],"source":"shape_8970","target":"shape_8118","number":null},'+
  '{"type":"domainStory:activity","name":"","id":"connection_9638","waypoints":[{"original":{"x":1014,"y":261},"x":1018,"y":308},{"original":{"x":1025,"y":384},"x":1022,"y":346}],"source":"shape_8118","target":"shape_9327","number":2},'+
  '{"type":"domainStory:activity","name":"","id":"connection_8306","waypoints":[{"original":{"x":719,"y":261},"x":719,"y":308},{"original":{"x":719,"y":409},"x":719,"y":371}],"source":"shape_8970","target":"shape_5439","number":null},'+
  '{"type":"domainStory:activity","name":"","id":"connection_6550","waypoints":[{"original":{"x":719,"y":409},"x":719,"y":456},{"original":{"x":719,"y":544},"x":719,"y":506}],"source":"shape_5439","target":"shape_5296","number":null},'+
  '{"type":"domainStory:activity","name":"","id":"connection_0196","waypoints":[{"original":{"x":1025,"y":384},"x":1025,"y":431},{"original":{"x":1025,"y":544},"x":1025,"y":506}],"source":"shape_9327","target":"shape_3974","number":null},'+
  '{"type":"domainStory:activity","name":"","id":"connection_2991","waypoints":[{"original":{"x":1025,"y":544},"x":1072,"y":548},{"original":{"x":1226,"y":563},"x":1193,"y":560}],"source":"shape_3974","target":"shape_8808","number":3},'+
  '{"type":"domainStory:activity","name":"","id":"connection_9263","waypoints":[{"original":{"x":719,"y":544},"x":764,"y":547},{"original":{"x":1005,"y":560},"x":987,"y":559}],"source":"shape_5296","target":"shape_3974","number":null},'+
  '{"type":"domainStory:connection","name":"","id":"connection_6966","waypoints":[{"original":{"x":1025,"y":544},"x":1045,"y":522},{"original":{"x":1156,"y":397},"x":1143,"y":412}],"source":"shape_3974","target":"shape_5750"},'+
  '{"type":"domainStory:connection","name":"","id":"connection_0733","waypoints":[{"original":{"x":1014,"y":261},"x":1046,"y":251},{"original":{"x":1159,"y":216},"x":1111,"y":231}],"source":"shape_8118","target":"shape_3367"},'+
  '{"info":"Eine Beschreibung"}]';

  var intricateV0_5_0_JsonString = '[{"type":"domainStory:actorPerson","name":"movie-goer","id":"shape_9977","x":214,"y":164},'+
  '{"type":"domainStory:workObjectDocument","name":"schedule","id":"shape_3526","x":214,"y":-45},'+
  '{"type":"domainStory:textAnnotation","name":"","id":"shape_1144","x":316,"y":-43,"text":"e.g. on billboard","number":27.874564459930312},'+
  '{"type":"domainStory:actorPerson","name":"cashier","id":"shape_4658","x":672,"y":164},'+
  '{"type":"domainStory:workObjectConversation","name":"movie, # of seats, time,..","id":"shape_5151","x":522,"y":-45},'+
  '{"type":"domainStory:actorSystem","name":"ticket system","id":"shape_6138","x":920,"y":164},'+
  '{"type":"domainStory:workObjectInfo","name":"available seats","id":"shape_8031","x":803,"y":-45},'+
  '{"type":"domainStory:workObjectDocument","name":"available seats","id":"shape_3387","x":522,"y":77},'+
  '{"type":"domainStory:workObjectConversation","name":"seats","id":"shape_7904","x":522,"y":190},'+
  '{"type":"domainStory:workObjectDocument","name":"ticket","id":"shape_8152","x":803,"y":99},'+
  '{"type":"domainStory:workObjectInfo","name":"chosen seats","id":"shape_4138","x":1071,"y":164},'+
  '{"type":"domainStory:workObjectConversation","name":"price","id":"shape_9422","x":522,"y":283},'+
  '{"type":"domainStory:workObjectConversation","name":"price","id":"shape_5209","x":522,"y":390},'+
  '{"type":"domainStory:workObjectDocument","name":"ticket","id":"shape_2043","x":803,"y":264},'+
  '{"type":"domainStory:workObjectDocument","name":"ticket","id":"shape_7902","x":522,"y":475},'+
  '{"type":"domainStory:activity","name":"chooses movie from","id":"connection_5202","number":"1","waypoints":[{"original":{"x":252,"y":202},"x":252,"y":164},{"original":{"x":252,"y":-7},"x":252,"y":40}],"source":"shape_9977","target":"shape_3526"},'+
  '{"type":"domainStory:connection","name":"","id":"connection_7380","waypoints":[{"original":{"x":252,"y":-7},"x":288,"y":-14},{"original":{"x":366,"y":-29},"x":316,"y":-19}],"source":"shape_3526","target":"shape_1144"},'+
  '{"type":"domainStory:activity","name":"asks for","id":"connection_7781","number":"2","waypoints":[{"original":{"x":252,"y":202},"x":277,"y":185},{"original":{"x":560,"y":-7},"x":522,"y":19}],"source":"shape_9977","target":"shape_5151"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_3361","number":null,"waypoints":[{"original":{"x":560,"y":-7},"x":602,"y":-7},{"x":697,"y":-7},{"original":{"x":697,"y":215},"x":697,"y":164}],"source":"shape_5151","target":"shape_4658"},'+
  '{"type":"domainStory:activity","name":"in","id":"connection_5224","number":null,"waypoints":[{"original":{"x":841,"y":-7},"x":883,"y":-7},{"x":925,"y":-7},{"original":{"x":958,"y":202},"x":952,"y":164}],"source":"shape_8031","target":"shape_6138"},'+
  '{"type":"domainStory:activity","name":"looks up","id":"connection_9708","number":3,"waypoints":[{"original":{"x":710,"y":202},"x":718,"y":167},{"x":755,"y":-7},{"original":{"x":809,"y":-7},"x":803,"y":-7}],"source":"shape_4658","target":"shape_8031"},'+
  '{"type":"domainStory:activity","name":"shows","id":"connection_2251","number":4,"waypoints":[{"original":{"x":710,"y":202},"x":672,"y":180},{"original":{"x":560,"y":115},"x":593,"y":134}],"source":"shape_4658","target":"shape_3387"},'+
  '{"type":"domainStory:activity","name":"to","id":"connection_6291","number":null,"waypoints":[{"original":{"x":560,"y":115},"x":522,"y":128},{"original":{"x":248,"y":219},"x":296,"y":203}],"source":"shape_3387","target":"shape_9977"},'+
  '{"type":"domainStory:activity","name":"selects","id":"connection_8965","number":5,"waypoints":[{"original":{"x":252,"y":202},"x":294,"y":211},{"x":369,"y":228},{"original":{"x":560,"y":228},"x":522,"y":228}],"source":"shape_9977","target":"shape_7904"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_3680","number":null,"waypoints":[{"original":{"x":560,"y":228},"x":597,"y":222},{"original":{"x":713,"y":204},"x":672,"y":210}],"source":"shape_7904","target":"shape_4658"},'+
  '{"type":"domainStory:activity","name":"issues","id":"connection_7770","number":6,"waypoints":[{"original":{"x":710,"y":202},"x":738,"y":188},{"original":{"x":841,"y":137},"x":803,"y":156}],"source":"shape_4658","target":"shape_8152"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_2904","number":null,"waypoints":[{"original":{"x":841,"y":137},"x":874,"y":156},{"original":{"x":954,"y":201},"x":920,"y":182}],"source":"shape_8152","target":"shape_6138"},'+
  '{"type":"domainStory:activity","name":"reserves","id":"connection_8784","number":7,"waypoints":[{"original":{"x":958,"y":202},"x":1000,"y":202},{"original":{"x":1109,"y":202},"x":1071,"y":202}],"source":"shape_6138","target":"shape_4138"},'+
  '{"type":"domainStory:activity","name":"tells","id":"connection_6154","number":8,"waypoints":[{"original":{"x":710,"y":202},"x":672,"y":232},{"original":{"x":560,"y":321},"x":584,"y":302}],"source":"shape_4658","target":"shape_9422"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_6050","number":null,"waypoints":[{"original":{"x":560,"y":321},"x":522,"y":321},{"x":469,"y":321},{"original":{"x":245,"y":216},"x":275,"y":230}],"source":"shape_9422","target":"shape_9977"},'+
  '{"type":"domainStory:activity","name":"pays","id":"connection_7890","number":9,"waypoints":[{"original":{"x":252,"y":202},"x":265,"y":241},{"x":328,"y":428},{"original":{"x":560,"y":428},"x":522,"y":428}],"source":"shape_9977","target":"shape_5209"},'+
  '{"type":"domainStory:activity","name":"","id":"connection_7262","number":null,"waypoints":[{"original":{"x":560,"y":428},"x":602,"y":428},{"x":661,"y":428},{"original":{"x":699,"y":239},"x":697,"y":249}],"source":"shape_5209","target":"shape_4658"},'+
  '{"type":"domainStory:activity","name":"prints","id":"connection_8506","number":10,"waypoints":[{"original":{"x":710,"y":202},"x":739,"y":224},{"original":{"x":841,"y":302},"x":803,"y":273}],"source":"shape_4658","target":"shape_2043"},'+
  '{"type":"domainStory:activity","name":"with","id":"connection_0126","number":null,"waypoints":[{"original":{"x":841,"y":302},"x":866,"y":284},{"original":{"x":971,"y":209},"x":920,"y":245}],"source":"shape_2043","target":"shape_6138"},'+
  '{"type":"domainStory:activity","name":"hands over","id":"connection_1646","number":"11","waypoints":[{"original":{"x":710,"y":202},"x":710,"y":249},{"x":710,"y":513},{"original":{"x":560,"y":513},"x":603,"y":513}],"source":"shape_4658","target":"shape_7902"},'+
  '{"info":"Assumption: no line at box office, seats available, cash payment"},'+
  '{"version":"0.5.0"}]';

  var data = JSON.parse(jsonString);
  var brokenData = JSON.parse(brokenJsonString);
  var oldIntricateV_0_2_0_Data = JSON.parse(oldIntricateV_0_2_0_JsonString);
  var oldIntricateV_0_3_0_Data = JSON.parse(oldIntricateV_0_3_0_JsonString);
  var intricateJSONString = JSON.parse(intricateV0_5_0_JsonString);
  // remove the info tag at the end before we load the data
  data.pop();
  brokenData.pop();
  intricateJSONString.pop();
  oldIntricateV_0_2_0_Data.pop();
  oldIntricateV_0_3_0_Data.pop();
  intricateJSONString.pop();

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  describe('domainStory import export Test simple data', function() {

    initActorIconDictionary(default_conf.actors);
    initWorkObjectIconDictionary(default_conf.workObjects);

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


  describe('domainStory import export Test broken data', function() {

    initActorIconDictionary(default_conf.actors);
    initWorkObjectIconDictionary(default_conf.workObjects);

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
    if (!Array.prototype.includes) {
      Object.defineProperty(Array.prototype, 'includes', {
        value: function(searchElement, fromIndex) {
          if (this == null) {
            throw new TypeError('"this" is null or not defined');
          }
          var o = Object(this);
          var len = o.length >>> 0;

          if (len === 0) {
            return false;
          }
          var n = fromIndex | 0;
          var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

          function sameValueZero(x, y) {
            return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
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

    var modeler;

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
      var elementRegistry = modeler.get('elementRegistry');
      var domainStoryElements = modeler.getCustomElements();
      // when

      modeler.importCustomElements(domainStoryElements);
      var actorPersonImport = elementRegistry.get('connection_3004');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
      expect(domainStoryElements[2].id).to.contain(actorPersonImport.id);

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
  });


  describe('domainStory import Test old intricate data V_0_2_0', function() {

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
    oldIntricateV_0_2_0_Data = updateCustomElementsPreviousv050(oldIntricateV_0_2_0_Data);
    modeler.importCustomElements(oldIntricateV_0_2_0_Data, function(err) {
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
  });

  describe('domainStory import Test old intricate data V_0_3_0', function() {

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
    const updatedData = updateCustomElementsPreviousv050(oldIntricateV_0_3_0_Data);
    modeler.importCustomElements(updatedData, function(err) {
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
      var actorPersonImport = elementRegistry.get('shape_8808');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
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
    modeler.importCustomElements(intricateJSONString, function(err) {
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
      var actorPersonImport = elementRegistry.get('shape_3387');

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

      newObject.push({ info: 'Assumption: no line at box office, seats available, cash payment' });
      newObject.push({ version: '0.5.0' });
      var jsonExport = '' + JSON.stringify(newObject);

      // then
      var jsonLength = jsonExport.length;
      var jsonElements = [];

      var index = jsonExport.indexOf('}')+1;
      while (index > 0) {
        var substring = jsonExport.slice(1, index);
        jsonElements.push(substring);
        jsonExport = jsonExport.slice(index);
        index= jsonExport.indexOf('}')+1;
      }

      expect(intricateV0_5_0_JsonString.length).to.eql(jsonLength);

      jsonElements.forEach(element =>{
        expect(intricateV0_5_0_JsonString.includes(element)).to.be.true;
      });
    });
  });
});
