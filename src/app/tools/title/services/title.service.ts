import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
} from '../../../domain/entities/constants';
import { CommandStackService } from '../../../domain/services/command-stack.service';
import { DialogService } from '../../../domain/services/dialog.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { TitleDialogComponent } from '../presentation/title-dialog/title-dialog.component';
import { Scope } from 'src/app/domain/entities/scope';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private readonly commandStackService = inject(CommandStackService);
  private readonly dialogService = inject(DialogService);

  private readonly titleSubject = new BehaviorSubject<string>(INITIAL_TITLE);
  private readonly scopeSubject = new BehaviorSubject<Scope | undefined>(
    undefined,
  );
  private readonly descriptionSubject = new BehaviorSubject<string>(
    INITIAL_DESCRIPTION,
  );
  private readonly showDescriptionSubject = new BehaviorSubject<boolean>(true);

  readonly title$ = this.titleSubject.asObservable();
  readonly description$ = this.descriptionSubject.asObservable();
  readonly showDescription$ = this.showDescriptionSubject.asObservable();

  openHeaderDialog(): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    this.dialogService.openDialog(TitleDialogComponent, config);
  }

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

    this.titleSubject.next(title);
    document.title = title === INITIAL_TITLE ? 'egon.io' : title;
  }

  private updateScope(scope: Scope | undefined): void {
    this.scopeSubject.next(scope);
  }

  private updateDescription(description: string | null): void {
    this.descriptionSubject.next(description ?? this.descriptionSubject.value);
  }

  setShowDescription(show: boolean): void {
    this.showDescriptionSubject.next(show);
  }

  getTitle(): string {
    return this.titleSubject.value;
  }

  getScope(): Scope | undefined {
    return this.scopeSubject.value;
  }

  getDescription(): string {
    return this.descriptionSubject.value;
  }

  getVersion(): string {
    return environment.version;
  }

  hasTitleOrDescription(): boolean {
    return (
      (this.getTitle().trim().length > 0 &&
        this.getTitle() !== INITIAL_TITLE) ||
      (this.getDescription().trim().length > 0 &&
        this.getDescription() !== INITIAL_DESCRIPTION)
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
