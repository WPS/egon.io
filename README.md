# Egon - The Domain Story Modeler

A tool to visualize Domain Stories in your browser.

## About

- See http://domainstorytelling.org for more information on Domain Storytelling.
- The [Egon.io Website](https://egon.io/) contains a user manual.

## Development

Download the source code or clone the repository. Please note that we use the main branch for development. The main branch contains the latest features and bug fixes, but they might be undocumented and tested less thoroughly than a release. To be on the safe side, stick with the latest release branch.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Deployment

There are several deployment options:

- Standalone version (Zip file): Best suited for offline use on a laptop, or if your organization already runs a web server (copy the zip file to the web server and extract it there to make Egon available to your organization).
- Docker container: If you prefer to provide websites as Docker container, you can build your own.
- If you don't want to build and deploy Egon.io yourself, than use one of the ready-to-use options provided by the Egon.io team:
  - Run [Egon.io online](https://egon.io/)
  - Use a ready-made Docker image: `docker pull ghcr.io/wps/egon.io:latest`

### Deploy Standalone Version (Zip file)
1. In the package.json and environment.prod.ts update the version-tag appropriately
2. Run the command **ng build**
   - This should create (or update the contents of) the folder **dist_build**
3. Run the command **npm run zip**
   - This should create (or update the contents of) the folder **dist** containing a zip.file named *egon-xxx*, where xxx is the name in the version-tag of the package.json

### Deploy Docker Container
1. In the root directory of your sourcecode, run `docker build -t egon-dev .`
2. To start the container, run `docker run -p 8080:80 egon-dev`

Adapt container name and port as needed.

## License

Egon - The Domain Story Modeler is licensed under GPLv3.0.
Egon uses [bpmn-js](https://github.com/bpmn-io/bpmn-js) which is licensed under the bpmn.io license.

### GPLv3.0

Copyright (c) 2018-present WPS - Workplace Solutions GmbH

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

### bpmn.io License

Copyright (c) 2014-present camunda Services GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The source code responsible for displaying the bpmn.io project watermark that links back to https://bpmn.io as part of rendered diagrams MUST NOT be removed or changed. When this software is being used in a website or application, the watermark must stay fully visible and not visually overlapped by other elements.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
