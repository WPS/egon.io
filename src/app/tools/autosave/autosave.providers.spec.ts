import { provideAutosave } from 'src/app/tools/autosave/autosave.providers';

describe('provideAutosave', () => {
  it('should return an app initializer provider', () => {
    expect(provideAutosave()).toBeTruthy();
  });
});
