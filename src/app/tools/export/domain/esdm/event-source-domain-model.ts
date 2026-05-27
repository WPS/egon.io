export interface EventSourceDomainMetadata {
  labels?: any[];
  annotations?: any[];
}

export interface EventSourceDomainScope {
  domain: string; // kebap-case
}

export enum PointInTime {
  asIs = 'as-is',
  toBe = 'to-be',
}

export enum Granularity {
  coarseGrained = 'coarse-grained',
  fineGrained = 'fine-grained',
}

export enum DomainPurity {
  pure = 'pure',
  digitalized = 'digitalized',
}

export interface EventSourceDomainGroup {
  name: string; // kebap-case
  description?: string;
  annotation?: string;
}

export interface EventSourceDomainActor {
  name: string; // kebap-case
  annotation?: string;
  groups?: string[]; // kebap-case
}

export interface EventSourceDomainWorkObject {
  name: string; // kebap-case
  annotation?: string;
  groups?: string[]; // kebap-case
}

export interface SentenceActor {
  actor: string; // kebap-case
}

export interface SentenceWorkObject {
  workObject: string; // kebap-case
}

export interface EventSourceDomainEdge {
  from: SentenceActor | SentenceWorkObject;
  to: SentenceActor | SentenceWorkObject;
  label?: string;
  annotation?: string;
  groups?: string[]; // kebap-case
}

export interface EventSourceDomainSentence {
  sequenceNumber: number;
  workObjects?: EventSourceDomainWorkObject[];
  edges: EventSourceDomainEdge[];
}

export interface EventSourceDomainModel {
  name: string; // kebap-case
  description?: string;
  metadata?: EventSourceDomainMetadata;
  scope: EventSourceDomainScope;
  pointInTime?: PointInTime;
  granularity?: Granularity;
  domainPurity?: DomainPurity;
  groups?: EventSourceDomainGroup[];
  actors?: EventSourceDomainActor[];
  sentences: EventSourceDomainSentence[];
}

export interface EventSourceDomainYaml {
  apiVersion: string;
  kind: string;

  name: string; // kebap-case
  description?: string;
  metadata?: EventSourceDomainMetadata;
  scope: EventSourceDomainScope;
  pointInTime?: PointInTime;
  granularity?: Granularity;
  domainPurity?: DomainPurity;
  groups?: EventSourceDomainGroup[];
  actors?: EventSourceDomainActor[];
  sentences: EventSourceDomainSentence[];
}
