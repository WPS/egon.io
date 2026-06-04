export interface Scope {
  granularity?: Granularity;
  pointInTime?: PointInTime;
  domainPurity?: DomainPurity;
}

export enum Granularity {
  COARSE_GRAINED = 'coarse_grained',
  FINE_GRAINED = 'fine_grained',
}

export enum PointInTime {
  AS_IS = 'as_is',
  TO_BE = 'to_be',
}

export enum DomainPurity {
  PURE = 'pure',
  DIGITALIZED = 'digitalized',
}
