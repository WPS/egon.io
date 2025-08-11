# Egon - The Domain Story Modeler

A tool to visualize Domain Stories in your browser.

## About

- See http://domainstorytelling.org for more information on Domain Storytelling.
- The [Egon.io Website](https://egon.io/) contains a user manual.

## Development

1. Install the dependencies via `npm ci`
2. Build and run Egon on a local development server via `npm run start`. Egon.io is accessible at http://localhost:4200.

Before committing any changes/creating pull requests, you should:

- Run tests via `npm run test`
- Run formatter via `npm run format`
- Check architecture rules via `npm run archlint`

## Architecture

See [architecture documentation](/architecture.md).

## Deployment

There are several deployment options:

- Standalone version (Zip file): If your organization already runs a web server, you can copy the zip file to the web server and extract it there to make Egon available to your organization.
- Docker container: If you prefer to provide websites as Docker container, you can build your own.
- If you don't want to build and deploy Egon.io yourself, than use one of the ready-to-use options provided by the Egon.io team:
  - Run [Egon.io online](https://egon.io/)
  - Download a ready-made Docker image `docker pull ghcr.io/wps/egon.io:latest` and run it `docker run -p 4040:80 ghcr.io/wps/egon.io:latest` (replace "4040" with whatever port you want to use)

### Build Standalone Version (Zip file)

1. In the package.json and environment.prod.ts update the version-tag appropriately
2. Run the command **ng build --configuration production**
   - This should create (or update the contents of) the folder **dist_build**
3. Run the command **npm run zip**
   - This should create (or update the contents of) the folder **dist** containing a zip.file named _egon-xxx_, where xxx is the name in the version-tag of the package.json

### Build Docker Container

1. In the root directory of your source code, run `docker build -t egon-dev .`
2. To start the container, run `docker run -p 8080:80 egon-dev`

Adapt container name ("egon-dev" in the above example) and port ("8080") as needed.

## License

Egon - The Domain Story Modeler is licensed under GPLv3.0.

Egon uses...

- [diagram-js](https://github.com/bpmn-io/diagram-js): Copyright (c) 2014—present Camunda Services GmbH
- [ngx-color-picker](https://www.npmjs.com/package/ngx-color-picker): Copyright (c) 2016 Zef Oy

which are licensed under the MIT license.

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

### The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
