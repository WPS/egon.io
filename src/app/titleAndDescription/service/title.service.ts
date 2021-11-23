import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export const initialTitle = '< title >';
export const initialDescription = '< description >';
export const initialDomainName = 'default';
const version = '2.0.0-alpha';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private title = initialTitle;
  private description = initialDescription;
  private domainName = initialDomainName;

  private titleSubject = new BehaviorSubject<string>(this.title);
  private descriptionSubject = new BehaviorSubject<string>(this.description);
  private domainNameSubject = new BehaviorSubject<string>(initialDomainName);
  private showDescription = new BehaviorSubject<boolean>(true);
  private commandStack: any;

  constructor() {}

  public setCommandStack(commandStack: any): void {
    this.commandStack = commandStack;
  }

  public updateTitleAndDescription(
    title: string | null,
    description: string | null,
    allowUndo: boolean
  ): void {
    if (allowUndo) {
      this.fireTitleAndDescriptionUpdate(title, description);
    } else {
      if (!title) {
        title = this.title;
      }
      if (!description) {
        description = this.description;
      }

      this.updateTitle(title);
      this.updateDescription(description);
    }
  }

  private updateTitle(title: string): void {
    this.titleSubject.next(title);
    this.title = title;
    document.title = title + ' - Domain Story Modeler';
  }

  private updateDescription(description: string): void {
    this.descriptionSubject.next(description);
    this.description = description;
  }

  public getTitleObservable(): Observable<string> {
    return this.titleSubject as Observable<string>;
  }

  public setShowDescription(show: boolean): void {
    this.showDescription.next(show);
  }

  public setDomainName(name: string): void {
    console.log(name);
    this.domainNameSubject.next(name);
  }

  public getShowDescriptionObservable(): Observable<boolean> {
    return this.showDescription.asObservable();
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescriptionObservable(): Observable<string> {
    return this.descriptionSubject as Observable<string>;
  }

  public getDescription(): string {
    return this.description;
  }

  public getVersion(): string {
    return version;
  }

  private fireTitleAndDescriptionUpdate(
    newTitle: string | null,
    newDescription: string | null
  ): void {
    const context = {
      newTitle,
      newDescription,
    };
    this.commandStack.execute('story.updateHeadlineAndDescription', context);
  }

  getDomainNameAsObservable(): Observable<string> {
    return this.domainNameSubject.asObservable();
  }

  getDomainName(): string {
    return this.domainNameSubject.value;
  }
}
