import { inject, Injectable } from '@angular/core';
import { BusinessObject } from 'src/app/domain/entities/businessObject';
import {
  DomainPurity,
  EventSourceDomainEdge,
  EventSourceDomainGroup,
  EventSourceDomainMetadata,
  EventSourceDomainModel,
  EventSourceDomainSentence,
  EventSourceDomainWorkObject,
  Granularity,
  PointInTime,
} from 'src/app/tools/export/domain/esdm/event-source-domain-model';
import { GroupBusinessObject } from 'src/app/domain/entities/groupBusinessObject';
import { ActivityBusinessObject } from 'src/app/domain/entities/activityBusinessObject';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import { StorySentence } from 'src/app/tools/replay/domain/storySentence';
import { StoryCreatorService } from 'src/app/tools/replay/services/story-creator.service';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';

@Injectable({
  providedIn: 'root',
})
export class EsdmService {
  private readonly storyCreatorService = inject(StoryCreatorService);
  private readonly elementRegistryService = inject(ElementRegistryService);

  public createEventSourceDomainModel(
    title: string,
    description: string,
    domainName: string,
    asIs: boolean,
    finegrained: boolean,
    digitalized: boolean,
  ): EventSourceDomainModel {
    const story: StorySentence[] =
      this.storyCreatorService.traceActivitiesAndCreateStory();
    const groups: GroupBusinessObject[] = this.elementRegistryService
      .getAllGroups()
      .map((g) => g.businessObject);

    const { actors, annotations } = this.extractStoryElements(story);

    return {
      name: this.toKebapCase(title),
      description,
      metadata: this.gatherMetadata(),
      scope: {
        domain: domainName,
      },
      pointInTime: asIs ? PointInTime.asIs : PointInTime.toBe,
      granularity: finegrained
        ? Granularity.fineGrained
        : Granularity.coarseGrained,
      domainPurity: digitalized ? DomainPurity.digitalized : DomainPurity.pure,
      groups: this.gatherEsdmGroups(groups, annotations),
      actors: this.gatherEsdmActors(actors, groups, annotations),
      sentences: this.createEsdmSentences(story, groups, annotations),
    };
  }

  private gatherEsdmGroups(
    groups: GroupBusinessObject[],
    annotations: { [p: string]: string },
  ): EventSourceDomainGroup[] {
    return groups.map((group) => {
      return {
        name: this.toKebapCase(group.id), // TODO Check if correct
        description: group.name, // TODO Check if correct
        annotation: this.getAnnotation(group.id, annotations),
      };
    });
  }

  private gatherEsdmActors(
    actors: BusinessObject[],
    groups: GroupBusinessObject[],
    annotations: { [p: string]: string },
  ) {
    return actors.map((a) => {
      return {
        name: this.toKebapCase(a.name),
        annotation: this.getAnnotation(a.id, annotations),
        groups: this.getGroupForBusinessObject(groups, a),
      };
    });
  }

  private gatherAnnotations(
    connections: ActivityBusinessObject[],
    textAnnotations: BusinessObject[],
  ): {
    [p: string]: string;
  } {
    const annotations: {
      [p: string]: string;
    } = {};
    connections.map((connection) => {
      const name = textAnnotations.find(
        (ta) => ta.id === connection.target,
      )?.name;
      if (!!name) {
        annotations[connection.source] = name;
      }
    });
    return annotations;
  }

  private extractStoryElements(story: StorySentence[]) {
    const textAnnotations: BusinessObject[] = [];
    const connections: ActivityBusinessObject[] = [];
    const actors: BusinessObject[] = [];

    story[story.length - 1].objects.forEach((object) => {
      if (object.type === ElementTypes.TEXTANNOTATION) {
        textAnnotations.push(object);
      } else if (object.type === ElementTypes.CONNECTION) {
        connections.push(object as ActivityBusinessObject);
      } else if (object.type === ElementTypes.ACTOR) {
        actors.push(object);
      }
    });
    const annotations = this.gatherAnnotations(connections, textAnnotations);
    return { actors, annotations };
  }

  private buildEdges(
    sentence: BusinessObject[],
    groups: GroupBusinessObject[],
    annotations: { [p: string]: string },
  ): EventSourceDomainEdge[] {
    const activities: ActivityBusinessObject[] = sentence
      .filter((o) => o.type === ElementTypes.ACTIVITY)
      .map((a) => a as ActivityBusinessObject);
    return activities.map((a) => {
      const fromActor =
        sentence.find((b) => b.id === a.source)?.type === ElementTypes.ACTOR;
      const toActor =
        sentence.find((b) => b.id === a.target)?.type === ElementTypes.ACTOR;

      return {
        groups: this.getGroupForBusinessObject(groups, a),
        annotation: this.getAnnotation(a.id, annotations),
        label: a.name,
        to: toActor ? { actor: a.source } : { workObject: a.source },
        from: fromActor ? { actor: a.source } : { workObject: a.source },
      };
    });
  }

  private getGroupForBusinessObject(
    groups: GroupBusinessObject[],
    object: BusinessObject,
  ) {
    return groups
      .filter((g) => g.children.includes(object.id))
      .map((g) => g.id);
  }

  private createEsdmSentences(
    story: StorySentence[],
    groups: GroupBusinessObject[],
    annotations: { [p: string]: string },
  ): EventSourceDomainSentence[] {
    const sentences: BusinessObject[][] = story.map((sentence) =>
      sentence.objects.filter((o) =>
        sentence.highlightedObjects.includes(o.id),
      ),
    );

    const esdmSentences: EventSourceDomainSentence[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];

      const edges: EventSourceDomainEdge[] = this.buildEdges(
        sentence,
        groups,
        annotations,
      );

      const workObjects: EventSourceDomainWorkObject[] = sentence
        .filter((o) => o.type === ElementTypes.WORKOBJECT)
        .map((w) => {
          return {
            name: this.toKebapCase(w.name),
            groups: this.getGroupForBusinessObject(groups, w),
            annotation: this.getAnnotation(w.id, annotations),
          };
        });
      esdmSentences.push({
        sequenceNumber: i,
        edges: edges,
        workObjects,
      });
    }

    return esdmSentences;
  }

  private gatherMetadata(): EventSourceDomainMetadata {
    // TODO
    return {
      labels: [],
      annotations: [],
    };
  }

  private getAnnotation(id: string, annotations: { [p: string]: string }) {
    return annotations[id];
  }

  private toKebapCase(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
