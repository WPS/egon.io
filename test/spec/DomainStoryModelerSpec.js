// import $ from 'jquery';

// import TestContainer from 'mocha-test-container-support';

// import DomainStoryModeler from '../../app/domain-story-modeler';

// import {
//     is
// } from 'bpmn-js/lib/util/ModelUtil';


// describe('domainStory modeler', function () {

//     // var jsonString1 = "[{\"type\":\"domainStory:actorPerson\",\"name\":\"Kunde\",\"id\":\"shape_4409\",\"x\":392,\"y\":239},{\"type\":\"domainStory:activity\",\"name\":\"schickt\",\"id\":\"connection_7746\",\"number\":1,\"waypoints\":[{\"original\":{\"x\":430,\"y\":277},\"x\":472,\"y\":277},{\"original\":{\"x\":798,\"y\":277},\"x\":760,\"y\":277}],\"source\":\"shape_4409\",\"target\":\"shape_2694\"},{\"type\":\"domainStory:workObjectEmail\",\"name\":\"E-Mail\",\"id\":\"shape_2694\",\"x\":760,\"y\":239},{\"type\":\"domainStory:actorPerson\",\"name\":\"Mitarbeiter\",\"id\":\"shape_2340\",\"x\":1157,\"y\":239},{\"type\":\"domainStory:activity\",\"name\":\"\",\"id\":\"connection_9334\",\"waypoints\":[{\"original\":{\"x\":798,\"y\":277},\"x\":841,\"y\":277},{\"original\":{\"x\":1195,\"y\":277},\"x\":1157,\"y\":277}],\"source\":\"shape_2694\",\"target\":\"shape_2340\"},{\"info\":\"Test Description\"}]";
//     var jsonString = '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133},{"type":"domainStory:workObject","name":"","id":"shape_8681","x":508,"y":133},{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681"},{"info":"test"}]';
//     var data = JSON.parse(jsonString);
//     var info = data.pop();

//     var container;

//     beforeEach(function () {
//         container = TestContainer.get(this);
//     });


//     describe('domainStory elements', function () {

//         // var modeler;

//         // // spin up modeler with custom element before each test
//         // beforeEach(function (done) {
//         //     modeler = new DomainStoryModeler({ container: container });
//         //     console.log(data);
//         //     modeler.importCustomElements(data, function (err) {
//         //         if (!err) {
//         //             done();
//         //         }
//         //     });
//         // });

//         it('test', function () {
//             console.log('test');
//         });

//         it('test2', function () {
//             console.log('test2');
//         });
//         // it('should import domainStory element', function () {

//         //     // given
//         //     var elementRegistry = modeler.get('elementRegistry');
//         //     console.log('elementRegistry');
//         //     console.log(elementRegistry);
//         //     var domainStoryElement = modeler.getCustomElements();
//         //     console.log('domainStoryElement');
//         //     console.log(domainStoryElement);
//         //     // when
//         //     var actorPerson = {
//         //         type: 'domainStory:actorPerson',
//         //         id: 'shape_4409',
//         //         x: 392,
//         //         y: 239
//         //     };

//         //     modeler.addCustomElements([domainStoryElement]);
//         //     var actorPersonImport = elementRegistry.get('shape_4409');

//         //     then
//         //     expect(is(actorPerson, 'domainStory:actorPerson')).to.be.true;

//         //     expect(actorPerson).to.exist;
//         //     expect(actorPerson).to.contain(domainStoryElement);

//         // });

//     });

// });
