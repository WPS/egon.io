import { downloadFile } from './downloadFile';

describe('downloadFile', () => {
  let anchor: HTMLAnchorElement;
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    anchor = document.createElement('a');
    clickSpy = jest.spyOn(anchor, 'click').mockImplementation(() => undefined);
    jest.spyOn(document, 'createElement').mockReturnValue(anchor);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    anchor.remove();
  });

  it('encodes the data by default and builds href, filename and click', () => {
    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const removeSpy = jest.spyOn(anchor, 'remove');

    downloadFile('hello world', 'data:text/plain,', 'my file', '.txt');

    expect(anchor.getAttribute('href')).toBe('data:text/plain,hello%20world');
    expect(anchor.getAttribute('download')).toBe('my file.txt');
    expect(anchor.style.display).toBe('none');
    expect(appendSpy).toHaveBeenCalledWith(anchor);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it('does not encode the data when encodeUri is false', () => {
    downloadFile('hello world', 'data:text/plain,', 'raw', '.svg', false);

    expect(anchor.getAttribute('href')).toBe('data:text/plain,hello world');
    expect(anchor.getAttribute('download')).toBe('raw.svg');
  });
});
