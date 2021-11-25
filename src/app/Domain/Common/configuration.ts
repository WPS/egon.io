export class Configuration {
  public actors: string[];
  public workObjects: string[];

  public constructor(actors: string[], workObjects: string[]) {
    this.actors = actors;
    this.workObjects = workObjects;
  }
}
