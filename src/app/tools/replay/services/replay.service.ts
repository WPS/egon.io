import { inject, Injectable } from '@angular/core';
import { DomManipulationService } from 'src/app/tools/replay/services/dom-manipulation.service';
import { StorySentence } from 'src/app/tools/replay/domain/storySentence';
import { StoryCreatorService } from './story-creator.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION_LONG,
  SNACKBAR_ERROR,
  SNACKBAR_INFO,
} from '../../../domain/entities/constants';

@Injectable({
  providedIn: 'root',
})
export class ReplayService {
  private story: StorySentence[] = [];
  private readonly currentSentence = new BehaviorSubject<number>(-1);
  private readonly maxSentenceNumber = new BehaviorSubject<number>(0);
  private readonly replayOnSubject = new BehaviorSubject<boolean>(false);

  readonly currentSentence$: Observable<number> =
    this.currentSentence.asObservable();
  readonly maxSentenceNumber$: Observable<number> =
    this.maxSentenceNumber.asObservable();
  readonly replayOn$ = this.replayOnSubject.asObservable();

  private readonly domManipulationService = inject(DomManipulationService);
  private readonly storyCreatorService = inject(StoryCreatorService);
  private readonly snackbar = inject(MatSnackBar);
  private contextPad: any;
  private palette: any;
  private selection: any;

  setReplayState(state: boolean): void {
    this.replayOnSubject.next(state);
  }

  getReplayOn(): boolean {
    return this.replayOnSubject.value;
  }

  isReplayable(): boolean {
    return this.storyCreatorService.traceActivitiesAndCreateStory().length > 0;
  }

  initializeReplay(story: StorySentence[]): void {
    this.currentSentence.next(1);
    this.story = story;
    this.maxSentenceNumber.next(this.story.length);
  }

  getCurrentSentenceNumber(): number {
    return this.currentSentence.value;
  }

  getMaxSentenceNumber(): number {
    return this.maxSentenceNumber.value;
  }

  nextSentence(): void {
    if (this.currentSentence.value < this.story.length) {
      this.currentSentence.next(this.currentSentence.value + 1);
      this.showCurrentSentence();
    }
  }

  previousSentence(): void {
    if (this.currentSentence.value > 1) {
      this.currentSentence.next(this.currentSentence.value - 1);
      this.showCurrentSentence();
    }
  }

  private showCurrentSentence() {
    this.domManipulationService.showSentence(
      this.story[this.currentSentence.value - 1],
      this.currentSentence.value > 1
        ? this.story[this.currentSentence.value - 2]
        : undefined,
    );
  }

  startReplay(checkSequenceNumbers = false): void {
    console.log('1');
    const story = this.storyCreatorService.traceActivitiesAndCreateStory();

    this.clearUserInteractionsOnCanvas();

    console.log('2');
    if (checkSequenceNumbers) {
      const missingSentences =
        this.storyCreatorService.getMissingSentences(story);
      if (missingSentences.length > 0) {
        const sentence = missingSentences.join(', ');
        this.snackbar.open(
          missingSentences.length === 1
            ? `The Domain Story is not complete. Sentence ${sentence} is missing.`
            : `The Domain Story is not complete. Sentences ${sentence} are missing.`,
          undefined,
          {
            duration: SNACKBAR_DURATION_LONG,
            panelClass: SNACKBAR_ERROR,
          },
        );
        return;
      }
    }
    console.log('3');

    this.initializeReplay(story);
    console.log('4');
    if (this.story.length > 0) {
      console.log('5');
      this.setReplayState(true);
      console.log('6');
      this.domManipulationService.showSentence(
        this.story[this.currentSentence.getValue() - 1],
      );
    } else {
      this.snackbar.open('You need a Domain Story for replay.', undefined, {
        duration: SNACKBAR_DURATION_LONG,
        panelClass: SNACKBAR_INFO,
      });
    }
  }

  private clearUserInteractionsOnCanvas() {
    const selectedElements: any[] = this.selection._selectedElements;
    selectedElements.forEach((element) => this.selection.deselect(element));

    this.contextPad.close();
    this.palette.close();
  }

  stopReplay(): void {
    this.currentSentence.next(-1);
    this.maxSentenceNumber.next(0);
    this.setReplayState(false);
    this.domManipulationService.showAll();
    this.palette.open();
  }

  setModelerContext(contextPad: any, palette: any, selection: any) {
    this.contextPad = contextPad;
    this.palette = palette;
    this.selection = selection;
  }
}
