export class InfoDialogData {
  public title: string;
  public infoText: string;
  public isInfo: boolean;
  public isLink: boolean;
  public linkText: string | undefined;

  constructor(
    title: string,
    infoText: string,
    isInfo: boolean,
    isLink: boolean = false,
    linkText?: string
  ) {
    this.title = title;
    this.infoText = infoText;
    this.isInfo = isInfo;
    this.isLink = isLink;
    this.linkText = linkText;
  }
}
