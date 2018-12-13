import {
  bootstrapBpmnJS,
  inject
} from '../../TestHelper';

// import {
//   assign
// } from 'min-dash';

import DomainStoryModeler from '../../../app/domain-story-modeler';


describe('domainStory modeling', function() {

  var xml = require('./diagram.bpmn');

  beforeEach(bootstrapBpmnJS(DomainStoryModeler, xml));


  describe('custom elements', function() {

    beforeEach(inject(function(bpmnjs) {


      var businessObject = {

        type: 'custom:triangle',
        id: 'CustomTriangle_1',
      };
      var customShape = {
        businessObject: businessObject,
        type: 'custom:triangle',
        id: 'CustomTriangle_1',
        x: 300,
        y: 300,
        height: 100,
        width: 100
      };

      bpmnjs.addCustomElements([customShape]);
    }));


    // it('should export custom element', inject(
    //   function(bpmnjs, elementRegistry, modeling) {

    //     // given
    //     var customElement = {
    //       type: 'domainStory:actor',
    //       id: 'CustomActor_1',
    //       x: 200,
    //       y: 400,
    //       height: 100,
    //       width: 100
    //     };

    //     var businessObject={
    //       type: 'domainStory:actor',
    //       id: 'CustomActor_1',
    //       x: 150,
    //       y: 350
    //     };

    //     assign({ businessObject: businessObject }, customElement);

    //     var position = { x: customElement.x, y: customElement.y },
    //         target = elementRegistry.get('Process_1');

    //     modeling.createShape(
    //       customElement,
    //       position,
    //       target
    //     );

    //     // when
    //     var customElements = bpmnjs.getCustomElements();

    //     // then
    //     // we can only check for parts of our element since the create shape function adds parts to the shape, we cannot model here
    //     expect(customElements[1]).to.contain(businessObject);
    //   }
    // ));


    it('should not resize custom shape', inject(function(elementRegistry, rules) {

      // given
      var customElement = elementRegistry.get('CustomTriangle_1');

      // when
      var allowed = rules.allowed('resize', { shape: customElement });

      // then
      expect(allowed).to.be.false;
    }));


    it('should update custom element', inject(function(elementRegistry, modeling) {

      // given
      var customElement = elementRegistry.get('CustomTriangle_1');

      // when
      modeling.moveShape(customElement, { x: 200, y: 50 }, customElement.parent);

      // then
      expect(customElement.x).to.equal(500);
      expect(customElement.y).to.equal(350);
    }));
  });


  describe('custom connections', function() {

    beforeEach(inject(function(bpmnjs) {

      var customShape = {
        type: 'custom:triangle',
        id: 'CustomTriangle_1',
        x: 400,
        y: 300
      };

      bpmnjs.addCustomElements([customShape]);
    }));


    it('should export custom connection', inject(
      function(bpmnjs, elementRegistry, modeling) {

        // given
        var customShape = elementRegistry.get('CustomTriangle_1'),
            taskShape = elementRegistry.get('Task_1');

        modeling.connect(customShape, taskShape, {
          type: 'domainStory:connection',
          id: 'CustomConnection_1'
        });

        // when
        var customElements = bpmnjs.getCustomElements();

        // then
        var ids = customElements.map(function(element) {
          return element.id;
        });

        expect(ids).to.include('CustomConnection_1');
      }
    ));

    it('should not connect custom shape to start event', inject(
      function(elementRegistry, rules) {

        // given
        var customShape = elementRegistry.get('CustomTriangle_1'),
            startEventShape = elementRegistry.get('StartEvent_1');

        // when
        var allowed = rules.allowed('connection.create', {
          source: customShape,
          target: startEventShape
        });

        // then
        expect(allowed).to.be.false;
      }
    ));


    it('should reconnect start', inject(function(bpmnjs, elementRegistry, modeling) {

      // given
      var customShape = elementRegistry.get('CustomTriangle_1'),
          taskShape = elementRegistry.get('Task_1');

      var customConnection = modeling.connect(customShape, taskShape, {
        type: 'domainStory:connection'
      });

      bpmnjs.addCustomElements([{
        type: 'doaminStory:actor',
        id: 'CustomCircle_1',
        x: 200,
        y: 300
      }]);

      var customCircle = elementRegistry.get('CustomCircle_1');

      // when
      modeling.reconnectStart(customConnection, customCircle, {
        x: customCircle.x + customCircle.width / 2,
        y: customCircle.y + customCircle.height / 2
      });

      // then
      expect(customConnection.source).to.equal(customCircle);
      expect(customConnection.target).to.equal(taskShape);
    }));


    it('should reconnect end', inject(function(bpmnjs, elementRegistry, modeling) {

      // given
      var customShape = elementRegistry.get('CustomTriangle_1'),
          taskShape1 = elementRegistry.get('Task_1'),
          taskShape2 = elementRegistry.get('Task_2');

      var customConnection = modeling.connect(customShape, taskShape1, {
        type: 'domainStory:connection'
      });

      // when
      modeling.reconnectEnd(customConnection, taskShape2, {
        x: taskShape2.x + taskShape2.width / 2,
        y: taskShape2.y + taskShape2.height / 2
      });

      // then
      expect(customConnection.source).to.equal(customShape);
      expect(customConnection.target).to.equal(taskShape2);
    }));


    it('should update custom connection', inject(function(elementRegistry, modeling) {

      // given
      var customElement = elementRegistry.get('CustomTriangle_1'),
          taskShape = elementRegistry.get('Task_1');

      var customConnection = modeling.connect(customElement, taskShape, {
        type: 'domainStory:connection'
      });

      // when
      modeling.moveShape(customElement, { x: 200, y: 50 }, customElement.parent);

      // then

      var waypoint1 = customConnection.businessObject.waypoints[0];
      var waypoint2 = customConnection.businessObject.waypoints[1];

      expect(waypoint1.x).to.eql(600);
      expect(waypoint1.y).to.eql(351);
      expect(waypoint2.x).to.eql(354);
      expect(waypoint2.y).to.eql(157);
    }));


    it('should remove deleted connection from _customElements', inject(
      function(bpmnjs, elementRegistry, modeling) {

        // given
        var customShape = elementRegistry.get('CustomTriangle_1'),
            taskShape = elementRegistry.get('Task_1'),
            customElements = bpmnjs.getCustomElements();

        var customConnection = modeling.connect(customShape, taskShape, {
          type: 'domainStory:connection'
        });

        // when
        modeling.removeConnection(customConnection);

        // then
        expect(customElements.length).to.equal(1);
      }
    ));

  });

});
