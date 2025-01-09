import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private titleSubject = new BehaviorSubject<string>(INITIAL_TITLE);
  private descriptionSubject = new BehaviorSubject<string>(INITIAL_DESCRIPTION);
  private showDescriptionSubject = new BehaviorSubject<boolean>(true);

  title$ = this.titleSubject.asObservable();
  description$ = this.descriptionSubject.asObservable();
  showDescription$ = this.showDescriptionSubject.asObservable();

  constructor(
    private commandStackService: CommandStackService,
    private dialogService: DialogService,
  ) {}

  openHeaderDialog(): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    this.dialogService.openDialog(TitleDialogComponent, config);
  }

  updateTitleAndDescription(
    title: string | null,
    description: string | null,
    allowUndo: boolean,
  ): void {
    if (allowUndo) {
      this.fireTitleAndDescriptionUpdate(title, description);
    } else {
      this.updateTitle(title);
      this.updateDescription(description);
    }
  }

  reset(): void {
    this.updateTitleAndDescription(INITIAL_TITLE, INITIAL_DESCRIPTION, false);
  }

  private updateTitle(inputTitle: string | null): void {
    const title =
      !inputTitle || inputTitle.trim().length === 0
        ? INITIAL_TITLE
        : inputTitle;

    this.titleSubject.next(title);
    document.title = title === INITIAL_TITLE ? 'egon.io' : title;
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

  private fireTitleAndDescriptionUpdate(
    newTitle: string | null,
    newDescription: string | null,
  ): void {
    const context = {
      newTitle,
      newDescription,
    };
    this.commandStackService.execute(
      'story.updateHeadlineAndDescription',
      context,
    );
  }
}
