export type ExportLocation = 'DROPBOX' | 'LOCAL';

export class ExportDialogData {
  title: string;
  options: ExportOption[];

  constructor(title: string, options: ExportOption[]) {
    this.title = title;
    this.options = options;
  }
}

export class ExportOption {
  exportLocation: ExportLocation;
  text: string;
  fn: any;
  tooltip: string;

  constructor(
    exportLocation: ExportLocation,
    text: string,
    tooltip: string,
    fn: any,
  ) {
    this.exportLocation = exportLocation;
    this.text = text;
    this.tooltip = tooltip;
    this.fn = fn;
  }
}
