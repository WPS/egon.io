import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  INITIAL_DESCRIPTION,
  INITIAL_DOMAIN_NAME,
  INITIAL_TITLE,
} from '../../Domain/Common/constants';
import { CommandStackService } from '../CommandStack/command-stack.service';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private titleSubject = new BehaviorSubject<string>(INITIAL_TITLE);
  private descriptionSubject = new BehaviorSubject<string>(INITIAL_DESCRIPTION);
  private domainNameSubject = new BehaviorSubject<string>(INITIAL_DOMAIN_NAME);
  private showDescriptionSubject = new BehaviorSubject<boolean>(true);

  title$ = this.titleSubject.asObservable();
  description$ = this.descriptionSubject.asObservable();
  showDescription$ = this.showDescriptionSubject.asObservable();
  domainName$ = this.domainNameSubject.asObservable();

  constructor(private commandStackService: CommandStackService) {}

  updateTitleAndDescription(
    title: string | null,
    description: string | null,
    allowUndo: boolean
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

  private updateTitle(title: string | null): void {
    this.titleSubject.next(title ?? this.titleSubject.value);
    document.title = title ?? this.titleSubject.value + ' - egon.io';
  }

  private updateDescription(description: string | null): void {
    this.descriptionSubject.next(description ?? this.descriptionSubject.value);
  }

  setShowDescription(show: boolean): void {
    this.showDescriptionSubject.next(show);
  }

  setDomainName(name: string): void {
    this.domainNameSubject.next(name);
  }

  getTitle(): string {
    return this.titleSubject.value;
  }

  getDescription(): string {
    return this.descriptionSubject.value;
  }

  getDomainName(): string {
    return this.domainNameSubject.value;
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
    newDescription: string | null
  ): void {
    const context = {
      newTitle,
      newDescription,
    };
    this.commandStackService.execute(
      'story.updateHeadlineAndDescription',
      context
    );
  }
}
