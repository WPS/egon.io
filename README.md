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

### Nav fork: Nais setup

This repository (`navikt/egon.io`) belongs to the Nais team `egon-io`.
The upstream website deployment and container publishing jobs have been removed.
The remaining CI workflow only runs checks, builds the production application,
and uploads a ZIP artifact to the workflow run. It does not deploy or publish images.
Production builds and ZIP artifacts run after successful checks, without a deploy input.

The Nais application uses the following environment mixins:

| Environment | Ingress | Replicas |
| --- | --- | --- |
| `dev-gcp` | `https://egon-io.ansatt.dev.nav.no` | 1 |
| `prod-gcp` | `https://egon-io.ansatt.nav.no` | 2 |

The `ansatt` domains are reachable over the internet, but the platform restricts
access to authenticated people on compliant devices. The application has no
separate Entra integration. See the [Nais environment reference](https://docs.nais.io/workloads/reference/environments/).
The former `egon-io.intern.dev.nav.no` ingress is removed on the next dev deploy;
it is not retained as an alternative ingress or redirect.

Pushes to `main` trigger verification, image building and deployment to dev-gcp.
Manual dev deployment is also available with the `deploy_to_dev` confirmation.
Production deployment remains manual and restricted to `main`. Pull requests
do not trigger deployment. Angular source code is unchanged.

#### Rollout and verification

Before switching domains, export any needed local drafts and custom icon sets
from the old address. Browser storage is origin-specific and does not move
automatically to the new address.

1. Run **Deploy to Nais dev-gcp** from `main`, confirming `deploy_to_dev`.
2. Verify the new dev address and platform access protection, including denial
   without an authenticated, compliant device. Check that the old internal
   address no longer serves the application.
3. Check pod readiness, `/isalive`, `/isready`, ingress errors and logs in Nais
   Console/Grafana. Exercise local import, editing and HTML export with fictitious
   data. This does not constitute security approval of the application.
4. Copy the immutable image reference (including `@sha256:...`) used by the
   successful dev deployment. Run **Deploy to Nais prod-gcp** from `main` with
   that reference and confirm `dev_verified` only after the checks above.
   The workflow validates the image registry and digest format; the operator is
   responsible for confirming it is the image tested in dev. It does not rebuild.
5. Verify prod access protection, application functionality, pod readiness and
   ingress errors before inviting users.

For prod rollback, manually deploy a previously verified digest through the prod workflow.
Reverting the ingress change would reopen the old internal entry point and must
be an explicit decision, not an automatic rollback. On the first prod deployment
there is no previous prod version: if necessary, remove the new ingress through
a reviewed manifest change and controlled deployment.

### General deployment options

There are several deployment options:

- Standalone version (Zip file): If your organization already runs a web server, you can copy the zip file to the web server and extract it there to make Egon available to your organization.
- Docker container: If you prefer to provide websites as Docker container, you can build your own.
- If you don't want to build and deploy Egon.io yourself, then use one of the ready-to-use options provided by the upstream Egon.io team (not images built by this fork):
  - Run [Egon.io online](https://egon.io/)
  - Download a ready-made Docker image `docker pull ghcr.io/wps/egon.io:latest` and run it `docker run -p 4040:80 ghcr.io/wps/egon.io:latest` (replace "4040" with whatever port you want to use)

### Build Standalone Version (Zip file)

1. In the package.json and environment.prod.ts update the version-tag appropriately
2. Run the command **ng build --configuration production**
   - This should create (or update the contents of) the folder **dist_build**
3. Run the command **npm run zip**
   - This should create (or update the contents of) the folder **dist** containing a zip.file named *egon-xxx*, where xxx is the name in the version-tag of the package.json

### Build Docker Container

1. In the root directory of your source code, run `docker build -t egon-dev .`
2. To start the container, run `docker run -p 8080:8080 egon-dev`

Adapt container name ("egon-dev" in the above example) and port ("8080") as needed.

## License

Egon - The Domain Story Modeler is licensed under GPLv3.0.

Egon uses...
- [diagram-js](https://github.com/bpmn-io/diagram-js): Copyright © 2014—present Camunda Services GmbH
- [ngx-color-picker](https://www.npmjs.com/package/ngx-color-picker): Copyright © 2016 Zef Oy

which are licensed under the MIT license.

### GPLv3.0

Copyright © 2018-present WPS - Workplace Solutions GmbH

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
