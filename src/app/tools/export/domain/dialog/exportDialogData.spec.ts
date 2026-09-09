import {
  ExportDialogData,
  ExportOption,
} from 'src/app/tools/export/domain/dialog/exportDialogData';

describe('ExportDialogData', () => {
  it('should store title, default filename and options', () => {
    const options = [new ExportOption('SVG', 'export as svg', () => undefined)];

    const data = new ExportDialogData('Export', 'my-story', options);

    expect(data.title).toBe('Export');
    expect(data.defaultFilename).toBe('my-story');
    expect(data.options).toBe(options);
  });
});

describe('ExportOption', () => {
  it('should store text, tooltip and callback', () => {
    const fn = jest.fn();

    const option = new ExportOption('PNG', 'export as png', fn);

    expect(option.text).toBe('PNG');
    expect(option.tooltip).toBe('export as png');
    expect(option.fn).toBe(fn);
  });

  it('should invoke the stored callback with forwarded arguments', () => {
    const fn = jest.fn();
    const option = new ExportOption('PNG', 'export as png', fn);

    option.fn('arg1', 2);

    expect(fn).toHaveBeenCalledWith('arg1', 2);
  });
});
