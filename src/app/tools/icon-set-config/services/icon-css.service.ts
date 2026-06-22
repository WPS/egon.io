import { Injectable } from '@angular/core';
import { ICON_CSS_CLASS_PREFIX } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { sanitizeForCss } from 'src/app/utils/sanitizer';

const ICON_CSS_SHEET_ID = 'iconsCss';

@Injectable({
  providedIn: 'root',
})
export class IconCssService {
  public addIconsToCss(iconSrc: string, iconName: string) {
    const iconCssSheet = document.getElementById(ICON_CSS_SHEET_ID);
    if (!iconCssSheet) {
      return;
    }

    const iconStyle =
      '.' +
      ICON_CSS_CLASS_PREFIX +
      sanitizeForCss(iconName) +
      '::before{ content: url("data:image/svg+xml;utf8,' +
      this.wrapSRCInSVG(iconSrc) +
      '"); margin: 3px;}';
    // @ts-ignore
    iconCssSheet?.sheet?.insertRule(
      iconStyle,
      // @ts-ignore
      iconCssSheet.sheet.cssRules.length,
    );
  }

  private wrapSRCInSVG(src: string): string {
    return (
      "<svg viewBox='0 0 22 22' width='22' height='22' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><image width='22' height='22' xlink:href='" +
      src +
      "'/></svg>"
    );
  }
}
