/* global Editor */

import Editor from "../diagram-js";

export default function Editorinvoker() {


// (1) create new editor instance

// @ts-ignore
  const diagram = new Editor({
// @ts-ignore
    container: document.querySelector('#container')
  });


// (2) draw diagram elements (i.e. import)

  const canvas = diagram.get('canvas');
  const elementFactory = diagram.get('elementFactory');

// add root
  var root = elementFactory.createRoot();

  canvas.setRootElement(root);

// add shapes
  var shape1 = elementFactory.createShape({
    x: 150,
    y: 100,
    width: 100,
    height: 80
  });

  canvas.addShape(shape1, root);

  var shape2 = elementFactory.createShape({
    x: 290,
    y: 220,
    width: 100,
    height: 80
  });

  canvas.addShape(shape2, root);


  var connection1 = elementFactory.createConnection({
    waypoints: [
      {x: 250, y: 180},
      {x: 290, y: 220}
    ],
    source: shape1,
    target: shape2
  });

  canvas.addConnection(connection1, root);


  var shape3 = elementFactory.createShape({
    x: 450,
    y: 80,
    width: 100,
    height: 80
  });

  canvas.addShape(shape3, root);

  var shape4 = elementFactory.createShape({
    x: 425,
    y: 50,
    width: 300,
    height: 200,
    isFrame: true
  });

  canvas.addShape(shape4, root);


// (3) interact with the diagram via API

  const selection = diagram.get('selection');

  selection.select(shape3);

}
