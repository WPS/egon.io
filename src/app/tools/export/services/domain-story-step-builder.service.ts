import { inject, Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { ActivityCanvasObject } from 'src/app/domain/entities/activity-canvas-object';
import { CanvasObject } from 'src/app/domain/entities/canvas-object';

export interface DomainStoryStepAnnotation {
  elementName: string;
  lines: string[];
}

export interface DomainStoryStep {
  stepNumber: number | string;
  stepParts: string[];
  annotations: DomainStoryStepAnnotation[];
}

export interface DomainStoryStepData {
  steps: DomainStoryStep[];
  actors: Set<string>;
  workObjects: Set<string>;
}

@Injectable({
  providedIn: 'root',
})
export class DomainStoryStepBuilderService {
  private readonly elementRegistryService = inject(ElementRegistryService);

  build(): DomainStoryStepData {
    const activities = this.elementRegistryService.getActivitiesFromActors();
    const actors = new Set<string>();
    const workObjects = new Set<string>();

    const steps = activities.map((a) => this.buildStep(a, actors, workObjects));

    return { steps, actors, workObjects };
  }

  private buildStep(
    activity: ActivityCanvasObject,
    actors: Set<string>,
    workObjects: Set<string>,
  ): DomainStoryStep {
    const stepNumber = activity.businessObject.number ?? '';
    const activityName = activity.businessObject.name ?? '';
    const sourceCanvas = activity.source;
    const targetCanvas = activity.target;
    const sourceName = sourceCanvas?.businessObject?.name ?? '';
    const targetName = targetCanvas?.businessObject?.name ?? '';

    if (sourceName) actors.add(sourceName);

    const stepParts = [sourceName, activityName, targetName].filter(Boolean);
    const annotations: DomainStoryStepAnnotation[] = [];

    this.collectAnnotations(sourceCanvas, sourceName, annotations);
    this.processTarget(
      targetCanvas,
      targetName,
      stepParts,
      annotations,
      actors,
      workObjects,
    );

    return { stepNumber, stepParts, annotations };
  }

  private processTarget(
    target: CanvasObject,
    targetName: string,
    stepParts: string[],
    annotations: DomainStoryStepAnnotation[],
    actors: Set<string>,
    workObjects: Set<string>,
  ): void {
    if (target?.type?.includes(ElementTypes.WORKOBJECT)) {
      workObjects.add(targetName);
      this.collectAnnotations(target, targetName, annotations);
      this.followWorkObjectChain(
        target,
        stepParts,
        annotations,
        actors,
        workObjects,
      );
    } else if (target?.type?.includes(ElementTypes.ACTOR)) {
      actors.add(targetName);
      this.collectAnnotations(target, targetName, annotations);
    }
  }

  private followWorkObjectChain(
    workObject: CanvasObject,
    stepParts: string[],
    annotations: DomainStoryStepAnnotation[],
    actors: Set<string>,
    workObjects: Set<string>,
  ): void {
    for (const outgoing of workObject.outgoing ?? []) {
      if (outgoing.businessObject?.number) continue;
      if (outgoing.target?.type?.includes(ElementTypes.TEXTANNOTATION))
        continue;

      const connLabel = outgoing.businessObject?.name ?? '';
      const nextName = outgoing.target?.businessObject?.name ?? '';
      if (connLabel) stepParts.push(connLabel);
      if (nextName) stepParts.push(nextName);

      this.registerAndAnnotate(
        outgoing.target,
        nextName,
        annotations,
        actors,
        workObjects,
      );
    }
  }

  private registerAndAnnotate(
    element: CanvasObject,
    name: string,
    annotations: DomainStoryStepAnnotation[],
    actors: Set<string>,
    workObjects: Set<string>,
  ): void {
    if (element?.type?.includes(ElementTypes.ACTOR)) {
      actors.add(name);
    } else if (element?.type?.includes(ElementTypes.WORKOBJECT)) {
      workObjects.add(name);
    }
    this.collectAnnotations(element, name, annotations);
  }

  private collectAnnotations(
    element: CanvasObject,
    elementName: string,
    annotations: DomainStoryStepAnnotation[],
  ): void {
    const lines = this.getTextAnnotationLines(element);
    if (lines.length > 0) {
      annotations.push({ elementName, lines });
    }
  }

  private annotationText(element: CanvasObject): string {
    // Text annotation content is stored in businessObject.text, not businessObject.name
    // (name is always empty ""; see domainStoryRenderer.js line 529)
    const bo = element.businessObject as any;
    return bo?.text || bo?.name || '';
  }

  private getTextAnnotationLines(element: CanvasObject): string[] {
    if (!element) return [];

    const seen = new Set<string>();
    const lines: string[] = [];

    const push = (text: string) =>
      text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((l) => {
          if (!seen.has(l)) {
            seen.add(l);
            lines.push(l);
          }
        });

    for (const outgoing of element.outgoing ?? []) {
      if (
        !outgoing.businessObject?.number &&
        outgoing.target?.type?.includes(ElementTypes.TEXTANNOTATION)
      ) {
        push(this.annotationText(outgoing.target));
      }
    }

    for (const incoming of element.incoming ?? []) {
      if (
        !incoming.businessObject?.number &&
        incoming.source?.type?.includes(ElementTypes.TEXTANNOTATION)
      ) {
        push(this.annotationText(incoming.source));
      }
    }

    return lines;
  }
}
