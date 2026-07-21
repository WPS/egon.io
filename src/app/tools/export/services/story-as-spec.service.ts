import { inject, Injectable } from '@angular/core';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import {
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
} from '../../../domain/entities/constants';
import {
  DomainStoryStep,
  DomainStoryStepBuilderService,
} from './domain-story-step-builder.service';

@Injectable({
  providedIn: 'root',
})
export class StoryAsSpecService {
  private readonly stepBuilder = inject(DomainStoryStepBuilderService);
  private readonly propertiesService = inject(PropertiesService);

  generateStoryAsSpec(): string {
    const { steps, actors, workObjects } = this.stepBuilder.build();

    const header = `Story: ${this.resolveTitle()}`;
    const goalLine = this.buildGoalLine();
    const stepTexts = steps.map((step) => this.buildStepText(step));
    const scenarioLines = this.buildScenarioLines(steps, stepTexts).join('\n');
    const actorsLine = this.buildEntityLine('Actors', actors);
    const entitiesLine = this.buildEntityLine('Entities', workObjects);
    const introLines = [header, goalLine].filter(Boolean).join('\n\n');

    return `${introLines}\n\nScenario:\n${scenarioLines}\n\n${actorsLine}\n${entitiesLine}\n`;
  }

  private resolveTitle(): string {
    const title = this.propertiesService.title();
    return title && title !== INITIAL_TITLE ? title : 'Story Name';
  }

  private buildGoalLine(): string {
    const description = this.propertiesService.description();
    const hasDescription = Boolean(
      description && description !== INITIAL_DESCRIPTION,
    );
    return hasDescription ? `Goal in Context: ${description}` : '';
  }

  private buildStepText(step: DomainStoryStep): string {
    const [actor, activity, target, ...rest] = step.stepParts;
    const base = [actor, activity, target].filter(Boolean).join(' ');

    if (rest.length === 0) return base;
    if (rest.length === 1) return `${base} with ${rest[0]}`;
    return step.stepParts.join(' → ');
  }

  private buildScenarioLines(
    steps: DomainStoryStep[],
    stepTexts: string[],
  ): string[] {
    if (steps.length === 0) return ['1. TODO: Describe the flow.'];

    return steps.map((step, index) => {
      const number = step.stepNumber !== '' ? step.stepNumber : index + 1;
      const notes = step.annotations.flatMap((a) => a.lines);
      const noteLine = notes.length > 0 ? `\n   (${notes.join('; ')})` : '';
      return `${number}. ${stepTexts[index]}${noteLine}`;
    });
  }

  private buildEntityLine(label: string, items: Set<string>): string {
    const list = [...items].filter(Boolean);
    return `${label}: ${
      list.length > 0 ? list.join(', ') : `TODO: List ${label.toLowerCase()}.`
    }`;
  }
}
