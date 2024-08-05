export class InfoDialogData {
  title: string;
  infoText: string;
  isInfo: boolean;
  isLink: boolean;
  linkText: string | undefined;

  constructor(
    title: string,
    infoText: string,
    isInfo: boolean,
    isLink: boolean = false,
    linkText?: string,
  ) {
    this.title = title;
    this.infoText = infoText;
    this.isInfo = isInfo;
    this.isLink = isLink;
    this.linkText = linkText;
  }
}
