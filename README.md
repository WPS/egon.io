## Domain Storytelling Modeler
A tool to visualize Domain Stories in your browser.

### About 
http://domainstorytelling.org

### Usage
A short definition on how to use the Domainstory-Telling Modeler.

#### Pallet
Shows the icons you can choose to tell your domain story.

#### Headline
Click on the headline to change the name of the domain story and describe it.

#### Context Menu
If you drop an icon from the pallet into the canvas you will see a context menu. To show the connection between two icons use the arrow. Also you can choose the next icon you want to connect to. If you choose one, it will automatically be connected. Delete the choosen icon by clicking on delete. You can click on the wrench to change the icon. By using the annotation icon, you can add comments for further information.

#### Label 
Double click on an icon or an activity to add a label. 

#### Automatically Numbered
If you draw an activity between an actor (person, people and system) and a workobject (folder, call, email, conversation, information) it will automatically consecutively numbered. By double clicking on the activity you also can manually change the number. All numbers which are equal or larger will increase automatically. 

#### File Management
To import a diagram use the upload button ![Upload Button](/images/unarchive.png). If you want to edit your diagram later, you can export it as a .dst file via the export button ![Export Button](/images/archive.png). You can also export your diagram as a .svg file by clicking on the image button ![SVG Button](/images/image.png).


## Run Application
Fetch dependencies:

```
npm install
```

Build example and open it in your browser:

```
npm run dev
```


## License
The Domain Story Modeler is licensed under GPLv3.0.
The Modeler uses  [bpmn-js](https://github.com/bpmn-io/bpmn-js) which is licensed under the bpmn.io license.

### GPLv3.0

Copyright (c) 2018 WPS - Workplace Solutions GmbH

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

### bpmn.io License

Copyright (c) 2014-2016 camunda Services GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The source code responsible for displaying the bpmn.io logo (two green cogwheels in a box) that links back to http://bpmn.io as part of rendered diagrams MUST NOT be removed or changed. When this software is being used in a website or application, the logo must stay fully visible and not visually overlapped by other elements.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.