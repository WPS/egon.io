import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import 'jest-canvas-mock';
import { deserialize, serialize } from 'node:v8';
import { ngMocks } from 'ng-mocks';

setupZoneTestEnv(); // initializes the Angular TestBed environment
ngMocks.autoSpy('jest'); // ng-mocks auto-creates Jest spies

// jsdom's global doesn't expose structuredClone; back it with v8 serialize,
// which faithfully implements the structured-clone algorithm.
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (<T>(value: T): T =>
    deserialize(serialize(value))) as typeof structuredClone;
}

// jsdom has no layout engine, so SVG geometry APIs are missing. diagram-js and
// several Egon services call getBBox() during rendering/measuring; stub it with
// a zero-sized box so those code paths don't throw under jsdom. getBBox is typed
// on SVGGraphicsElement, so we assign through `any`.
if (typeof SVGElement !== 'undefined') {
  const svgProto = SVGElement.prototype as unknown as {
    getBBox?: () => DOMRect;
  };
  if (!svgProto.getBBox) {
    svgProto.getBBox = () =>
      ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => ({}),
      }) as DOMRect;
  }
}
