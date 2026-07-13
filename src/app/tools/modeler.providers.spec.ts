import { provideModeler } from 'src/app/tools/modeler.providers';

describe('provideModeler', () => {
  it('should return an app initializer provider', () => {
    expect(provideModeler()).toBeTruthy();
  });
});
