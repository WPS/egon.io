export class Configuration {
  actors: string[];
  workObjects: string[];

  constructor(actors: string[], workObjects: string[]) {
    this.actors = actors;
    this.workObjects = workObjects;
  }
}
