import { bootstrapBpmnJS, inject } from "./testHelper";

import { assign } from "min-dash";
import DomainStoryModeler from "../index";
import { ElementTypes } from "../../../../domain/entities/common/elementTypes";

describe("domainStory modeling", function () {
  const xml = require("./language/diagram.bpmn");

  beforeEach(bootstrapBpmnJS(DomainStoryModeler, xml));

  describe("custom elements", function () {
    beforeEach(inject(function (bpmnjs) {
      const businessObject = {
        type: "custom:triangle",
        id: "CustomTriangle_1",
      };
      const customShape = {
        businessObject: businessObject,
        type: "custom:triangle",
        id: "CustomTriangle_1",
        x: 300,
        y: 300,
        height: 100,
        width: 100,
      };
      bpmnjs.addCustomElements([customShape]);
    }));

    it("should export custom element", inject(function (
      bpmnjs,
      elementRegistry,
      modeling,
    ) {
      // type has to be registered for test
      // initTypeDictionaries(test_conf.actors);

      // given
      const customElement = {
        type: "domainStory:actorPerson",
        id: "CustomActor_1",
        x: 200,
        y: 400,
        height: 100,
        width: 100,
      };

      const businessObject = {
        type: "domainStory:actorPerson",
        id: "CustomActor_1",
        x: 150,
        y: 350,
      };

      assign({ businessObject: businessObject }, customElement);
      const position = { x: customElement.x, y: customElement.y },
        target = elementRegistry.get("Process_1");

      modeling.createShape(customElement, position, target);

      // when
      const customElements = bpmnjs.getCustomElements();

      // then
      // we can only check for parts of our element since the create shape function adds parts to the shape, we cannot model here
      expect(customElements[1]).toContain(businessObject);
    }));

    it("should not resize custom shape", inject(function (
      elementRegistry,
      rules,
    ) {
      // given
      const customElement = elementRegistry.get("CustomTriangle_1");

      // when
      const allowed = rules.allowed("resize", { shape: customElement });

      // then
      expect(allowed).toBeFalsy();
    }));

    it("should update custom element", inject(function (
      elementRegistry,
      modeling,
    ) {
      // given
      const customElement = elementRegistry.get("CustomTriangle_1");

      // when
      modeling.moveShape(
        customElement,
        { x: 200, y: 50 },
        customElement.parent,
      );

      // then
      expect(customElement.x).toEqual(500);
      expect(customElement.y).toEqual(350);
    }));
  });

  describe("custom connections", function () {
    beforeEach(inject(function (bpmnjs) {
      const customShape = {
        type: "custom:triangle",
        id: "CustomTriangle_1",
        x: 400,
        y: 300,
      };

      bpmnjs.addCustomElements([customShape]);
    }));

    it("should export custom connection", inject(function (
      bpmnjs,
      elementRegistry,
      modeling,
    ) {
      // given
      const customShape = elementRegistry.get("CustomTriangle_1"),
        taskShape = elementRegistry.get("Task_1");

      modeling.connect(customShape, taskShape, {
        type: CONNECTION,
        id: "CustomConnection_1",
      });

      // when
      const customElements = bpmnjs.getCustomElements();

      // then
      const ids = customElements.map(function (element) {
        return element.id;
      });

      expect(ids).toContain("CustomConnection_1");
    }));

    it("should not connect custom shape to start event", inject(function (
      elementRegistry,
      rules,
    ) {
      // given
      const customShape = elementRegistry.get("CustomTriangle_1"),
        startEventShape = elementRegistry.get("StartEvent_1");

      // when
      const allowed = rules.allowed("connection.create", {
        source: customShape,
        target: startEventShape,
      });

      // then
      expect(allowed).toBeFalsy();
    }));

    it("should reconnect start", inject(function (
      bpmnjs,
      elementRegistry,
      modeling,
    ) {
      // given
      const customShape = elementRegistry.get("CustomTriangle_1"),
        taskShape = elementRegistry.get("Task_1");

      const customConnection = modeling.connect(customShape, taskShape, {
        type: ElementTypes.CONNECTION,
      });

      bpmnjs.addCustomElements([
        {
          type: "doaminStory:actor",
          id: "CustomCircle_1",
          x: 200,
          y: 300,
        },
      ]);

      const customCircle = elementRegistry.get("CustomCircle_1");

      // when
      modeling.reconnectStart(customConnection, customCircle, {
        x: customCircle.x + customCircle.width / 2,
        y: customCircle.y + customCircle.height / 2,
      });

      // then
      expect(customConnection.source).toEqual(customCircle);
      expect(customConnection.target).toEqual(taskShape);
    }));

    it("should reconnect end", inject(function (
      bpmnjs,
      elementRegistry,
      modeling,
    ) {
      // given
      const customShape = elementRegistry.get("CustomTriangle_1"),
        taskShape1 = elementRegistry.get("Task_1"),
        taskShape2 = elementRegistry.get("Task_2");

      const customConnection = modeling.connect(customShape, taskShape1, {
        type: ElementTypes.CONNECTION,
      });

      // when
      modeling.reconnectEnd(customConnection, taskShape2, {
        x: taskShape2.x + taskShape2.width / 2,
        y: taskShape2.y + taskShape2.height / 2,
      });

      // then
      expect(customConnection.source).toEqual(customShape);
      expect(customConnection.target).toEqual(taskShape2);
    }));

    it("should update custom connection", inject(function (
      elementRegistry,
      modeling,
    ) {
      // given
      const customElement = elementRegistry.get("CustomTriangle_1"),
        taskShape = elementRegistry.get("Task_1");

      const customConnection = modeling.connect(customElement, taskShape, {
        type: ElementTypes.CONNECTION,
      });

      // when
      modeling.moveShape(
        customElement,
        { x: 200, y: 50 },
        customElement.parent,
      );

      // then

      const waypoint1 = customConnection.businessObject.waypoints[0];
      const waypoint2 = customConnection.businessObject.waypoints[1];

      expect(waypoint1.x).toEqual(600);
      expect(waypoint1.y).toEqual(351);
      expect(waypoint2.x).toEqual(354);
      expect(waypoint2.y).toEqual(157);
    }));

    it("should remove deleted connection from _customElements", inject(function (
      bpmnjs,
      elementRegistry,
      modeling,
    ) {
      // given
      const customShape = elementRegistry.get("CustomTriangle_1"),
        taskShape = elementRegistry.get("Task_1"),
        customElements = bpmnjs.getCustomElements();

      const customConnection = modeling.connect(customShape, taskShape, {
        type: ElementTypes.CONNECTION,
      });

      // when
      modeling.removeConnection(customConnection);

      // then
      expect(customElements.length).toEqual(1);
    }));
  });
});
