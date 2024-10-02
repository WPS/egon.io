export interface ShortCut {
  description: string,
  shortCut: string
}

export interface ShortcutDialogData {
  title: string;
  shortCuts: ShortCut[];
}
