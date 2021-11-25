export interface DomainConfiguration {
  name: string;
  actors: { [key: string]: any };
  workObjects: { [key: string]: any };
}

export interface CustomDomainCofiguration {
  name: string;
  actors: string[];
  workObjects: string[];
}
