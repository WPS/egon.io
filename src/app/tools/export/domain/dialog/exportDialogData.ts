export class ExportDialogData {
  title: string;
  defaultFilename: string;
  options: ExportOption[];

  constructor(title: string, defaultFilename: string, options: ExportOption[]) {
    this.title = title;
    this.options = options;
    this.defaultFilename = defaultFilename;
  }
}

export class ExportOption {
  text: string;
  fn: (...args: any[]) => void;
  tooltip: string;

  constructor(text: string, tooltip: string, fn: (...args: any[]) => void) {
    this.text = text;
    this.tooltip = tooltip;
    this.fn = fn;
  }
}
