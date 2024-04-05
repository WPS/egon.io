import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  INITIAL_DESCRIPTION,
  INITIAL_ICON_SET_NAME,
  INITIAL_TITLE,
} from '../../Domain/Common/constants';
import { CommandStackService } from '../CommandStack/command-stack.service';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private titleSubject = new BehaviorSubject<string>(INITIAL_TITLE);
  private descriptionSubject = new BehaviorSubject<string>(INITIAL_DESCRIPTION);
  private iconSetNameSubject = new BehaviorSubject<string>(
    INITIAL_ICON_SET_NAME,
  );
  private showDescriptionSubject = new BehaviorSubject<boolean>(true);

  title$ = this.titleSubject.asObservable();
  description$ = this.descriptionSubject.asObservable();
  showDescription$ = this.showDescriptionSubject.asObservable();
  iconSetName$ = this.iconSetNameSubject.asObservable();

  constructor(private commandStackService: CommandStackService) {}

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

  setIconSetName(name: string): void {
    this.iconSetNameSubject.next(name);
  }

  getTitle(): string {
    return this.titleSubject.value;
  }

  getDescription(): string {
    return this.descriptionSubject.value;
  }

  getIconSetName(): string {
    return this.iconSetNameSubject.value;
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
