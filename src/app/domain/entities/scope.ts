export interface Scope {
  granularity?: Granularity_Grain | Granularity_Goal;
  pointInTime?: PointInTime;
  domainPurity?: DomainPurity;
}

export enum PointInTime {
  AS_IS = 'as_is',
  TO_BE = 'to_be',
}

export enum DomainPurity {
  PURE = 'pure',
  DIGITALIZED = 'digitalized',
}

export enum Granularity_Grain {
  COARSE = 'coarse',
  MEDIUM = 'medium',
  FINE = 'fine',
}

export enum Granularity_Goal {
  CLOUD = 'cloud',
  KITE = 'kite',
  SEA = 'sea',
  FISH = 'fisch',
  CLAM = 'clam',
}
