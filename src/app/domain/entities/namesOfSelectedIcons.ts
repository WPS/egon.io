export class NamesOfSelectedIcons {
  actors: string[];
  workObjects: string[];

  constructor(actors: string[], workObjects: string[]) {
    this.actors = actors;
    this.workObjects = workObjects;
  }
}

export const namesOfDefaultIcons = {
  actors: ['Person', 'Group', 'System'],
  workObjects: ['Document', 'Folder', 'Call', 'Email', 'Conversation', 'Info'],
};
