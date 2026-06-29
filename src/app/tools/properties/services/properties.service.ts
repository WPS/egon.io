import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
} from '../../../domain/entities/constants';
import { CommandStackService } from 'src/app/tools/modeler/services/command-stack.service';
import { Scope } from 'src/app/domain/entities/scope';

@Injectable({
  providedIn: 'root',
})
export class PropertiesService {
  private readonly commandStackService = inject(CommandStackService);

  private readonly titleSignal = signal(INITIAL_TITLE);
  private readonly scopeSignal = signal(undefined as Scope | undefined);
  private readonly descriptionSignal = signal(INITIAL_DESCRIPTION);

  readonly title = this.titleSignal.asReadonly();
  readonly description = this.descriptionSignal.asReadonly();
  readonly scope = this.scopeSignal.asReadonly();

  updateTitleAndDescriptionAndScope(
    title: string | null,
    description: string | null,
    scope: Scope | undefined,
    allowUndo: boolean,
  ): void {
    if (allowUndo) {
      this.fireTitleAndDescriptionAndScopeUpdate(title, description, scope);
    } else {
      this.updateTitle(title);
      this.updateDescription(description);
      this.updateScope(scope);
    }
  }

  reset(): void {
    this.updateTitleAndDescriptionAndScope(
      INITIAL_TITLE,
      INITIAL_DESCRIPTION,
      undefined,
      false,
    );
  }

  private updateTitle(inputTitle: string | null): void {
    const title =
      !inputTitle || inputTitle.trim().length === 0
        ? INITIAL_TITLE
        : inputTitle;

    this.titleSignal.set(title);
    document.title = title === INITIAL_TITLE ? 'egon.io' : title;
  }

  private updateScope(scope: Scope | undefined): void {
    this.scopeSignal.set(scope);
  }

  private updateDescription(description: string | null): void {
    this.descriptionSignal.set(description ?? this.descriptionSignal());
  }

  hasTitleOrDescription(): boolean {
    return (
      (this.title().trim().length > 0 && this.title() !== INITIAL_TITLE) ||
      (this.description().trim().length > 0 &&
        this.description() !== INITIAL_DESCRIPTION)
    );
  }

  private fireTitleAndDescriptionAndScopeUpdate(
    newTitle: string | null,
    newDescription: string | null,
    newScope: Scope | undefined,
  ): void {
    const context = {
      newTitle,
      newDescription,
      newScope,
    };
    this.commandStackService.execute(
      'story.updateHeadlineAndDescriptionAndScope',
      context,
    );
  }
}
