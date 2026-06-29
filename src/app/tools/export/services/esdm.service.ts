import { inject, Injectable } from '@angular/core';
import {
  EventSourceDomainEdge,
  EventSourceDomainGroup,
  EventSourceDomainMetadata,
  EventSourceDomainModel,
  EventSourceDomainSentence,
  EventSourceDomainWorkObject,
} from 'src/app/tools/export/domain/esdm/event-source-domain-model';
import { StorySentence } from 'src/app/tools/replay/domain/storySentence';
import { StoryCreatorService } from 'src/app/tools/replay/services/story-creator.service';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { AnnotationBusinessObject } from 'src/app/domain/entities/annotationBusinessObject';
import {
  DomainPurity,
  Granularity_Goal,
  Granularity_Grain,
  PointInTime,
} from 'src/app/domain/entities/scope';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { GroupCanvasObject } from 'src/app/domain/entities/group-canvas-object';
import { BusinessObject } from 'src/app/domain/entities/business-object';
import { ActivityBusinessObject } from 'src/app/domain/entities/activity-business-object';
import { ElementTypes } from 'src/app/domain/entities/element-types';

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
    pointInTime: PointInTime | undefined,
    granularity: Granularity_Goal | Granularity_Grain | undefined,
    domainPurity: DomainPurity | undefined,
  ): EventSourceDomainModel {
    const story: StorySentence[] =
      this.storyCreatorService.traceActivitiesAndCreateStory()
        .storyWithGroupsInLastSentence;
    const groups: GroupCanvasObject[] =
      this.elementRegistryService.getAllGroups();

    const { actors, annotations } = this.extractStoryElements(story);

    return {
      name: this.toKebapCase(title),
      description,
      metadata: this.gatherMetadata(),
      scope: {
        domain: domainName,
      },
      pointInTime,
      domainPurity,
      granularity,
      groups: this.gatherEsdmGroups(groups, annotations),
      actors: this.gatherEsdmActors(actors, groups, annotations),
      sentences: this.createEsdmSentences(story, groups, annotations),
    };
  }

  private gatherEsdmGroups(
    groups: GroupCanvasObject[],
    annotations: Dictionary<string>,
  ): EventSourceDomainGroup[] {
    return groups.map((group) => {
      return {
        name: this.toKebapCase(group.id),
        description: group.name,
        annotation: this.findAnnotation(group.id, annotations),
      };
    });
  }

  private gatherEsdmActors(
    actors: BusinessObject[],
    groups: GroupCanvasObject[],
    annotations: Dictionary<string>,
  ) {
    return actors.map((a) => {
      return {
        name: this.toKebapCase(a.name),
        annotation: this.findAnnotation(a.id, annotations),
        groups: this.getGroupForBusinessObject(groups, a),
      };
    });
  }

  private gatherAnnotations(
    connections: ActivityBusinessObject[],
    textAnnotations: AnnotationBusinessObject[],
  ): Dictionary<string> {
    const annotations = new Dictionary<string>();

    connections.map((connection) => {
      const name = textAnnotations.find(
        (ta) => ta.id === connection.target,
      )?.text;
      if (name) {
        annotations.set(connection.source, name);
      }
    });
    return annotations;
  }

  private extractStoryElements(story: StorySentence[]) {
    const textAnnotations: AnnotationBusinessObject[] = [];
    const connections: ActivityBusinessObject[] = [];
    const actors: BusinessObject[] = [];

    story[story.length - 1].objects.forEach((object) => {
      if (object.type.includes(ElementTypes.TEXTANNOTATION)) {
        textAnnotations.push(object as AnnotationBusinessObject);
      } else if (object.type.includes(ElementTypes.CONNECTION)) {
        connections.push(object as ActivityBusinessObject);
      } else if (object.type.includes(ElementTypes.ACTOR)) {
        actors.push(object);
      }
    });
    const annotations = this.gatherAnnotations(connections, textAnnotations);
    return { actors, annotations };
  }

  private buildEdges(
    sentence: BusinessObject[],
    groups: GroupCanvasObject[],
    annotations: Dictionary<string>,
  ): EventSourceDomainEdge[] {
    const activities: ActivityBusinessObject[] = sentence
      .filter((o) => o.type.includes(ElementTypes.ACTIVITY))
      .map((a) => a as ActivityBusinessObject);
    return activities.map((a) => {
      const fromActor = sentence
        .find((b) => b.id === a.source)
        ?.type.includes(ElementTypes.ACTOR);
      const toActor = sentence
        .find((b) => b.id === a.target)
        ?.type.includes(ElementTypes.ACTOR);

      return {
        from: fromActor
          ? { actor: sentence.find((b) => b.id === a.source)!.name }
          : { workObject: sentence.find((b) => b.id === a.source)!.name },
        to: toActor
          ? { actor: sentence.find((b) => b.id === a.target)!.name }
          : { workObject: sentence.find((b) => b.id === a.target)!.name },
        label: a.name,
        annotation: this.findAnnotation(a.id, annotations),
        groups: this.getGroupForBusinessObject(groups, a),
      };
    });
  }

  private getGroupForBusinessObject(
    groups: GroupCanvasObject[],
    object: BusinessObject,
  ) {
    return groups
      .filter((g) => g.children!.map((c) => c.id).includes(object.id))
      .map((g) => g.id);
  }

  private createEsdmSentences(
    story: StorySentence[],
    groups: GroupCanvasObject[],
    annotations: Dictionary<string>,
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
        .filter((o) => o.type.includes(ElementTypes.WORKOBJECT))
        .map((w) => {
          return {
            name: this.toKebapCase(w.name),
            groups: this.getGroupForBusinessObject(groups, w),
            annotation: this.findAnnotation(w.id, annotations),
          };
        });
      esdmSentences.push({
        sequenceNumber: i + 1,
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

  private findAnnotation(id: string, annotations: Dictionary<string>) {
    return annotations.find(id);
  }

  private toKebapCase(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
