# Agenda

- when deleting a group over multi element context pad, all children get removed. fix!
- fix tests
- move all js files into diagram-js, remove bpmn folder
- di $descriptor, $type should be removed

### Changed but might be better or not worth fixing

- lasso tool displays a frame around all selected elements
- when selected by lasso tool, hovering over an element does not change the outline to egon blue
- connect with activity dashed line is blue until you hover over an allowed target

### bugs not reproduceable
- space tool works but sometimes the preview gets stuck
![img.png](img.png)

### future bugs
- color change for text annotations with several connections
- is it okay that when connecting with activity from a shape, hovering over a group lets create a connection from the group to the shape?
- when creating bendpoints on a colored activity, during creation the activity is displayed as black
- no snapping to shape middle when connecting (could also be a feature)
