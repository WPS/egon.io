export interface Scope {
  granularity: string;
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
