// // TODO
// // our code uses string.includes functions which are not supported by PhantomJS version 2.1.0

// import TestContainer from 'mocha-test-container-support';

// import DomainStoryModeler from '../../app/domain-story-modeler';

// import {
//   is
// } from 'bpmn-js/lib/util/ModelUtil';


// describe('domainStory modeler', function() {

//   var jsonString = '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133},{"type":"domainStory:workObject","name":"","id":"shape_8681","x":508,"y":133},{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681"},{"info":"test"}]';
//   var data = JSON.parse(jsonString);
//   // remove the info tag at the end before we load the data
//   var info = data.pop();

//   var container;

//   beforeEach(function() {
//     container = TestContainer.get(this);
//   });


//   describe('domainStory elements', function() {

//     var modeler;

//     // spin up modeler with custom element, do this only once, using before each takes too long and triggers the timeout
//     modeler = new DomainStoryModeler({ container: container });
//     console.log(data);
//     modeler.importCustomElements(data, function(err) {
//       if (err) {
//         console.log(err);
//       }
//     });

//     it('should import domainStory element', function() {

//       // given
//       var elementRegistry = modeler.get('elementRegistry');
//       var domainStoryElement = modeler.getCustomElements();
//       // when
//       var actorPerson = {
//         type: 'domainStory:actorPerson',
//         id: 'shape_4409',
//         x: 392,
//         y: 239
//       };

//       modeler.addCustomElements([domainStoryElement]);
//       var actorPersonImport = elementRegistry.get('shape_4409');

//       // then
//       expect(is(actorPerson, 'domainStory:actorPerson')).to.be.true;

//       expect(actorPerson).to.exist;
//       expect(actorPerson).to.contain(domainStoryElement);

//     });

//   });

// });
