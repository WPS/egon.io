export class ExportDialogData {
  title: string;
  options: ExportOption[];

  constructor(title: string, options: ExportOption[]) {
    this.title = title;
    this.options = options;
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
