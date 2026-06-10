import { inject, Injectable, signal } from '@angular/core';
import { DomManipulationService } from 'src/app/tools/replay/services/dom-manipulation.service';
import { StorySentence } from 'src/app/tools/replay/domain/storySentence';
import { StoryCreatorService } from './story-creator.service';
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
  private readonly currentSentenceSignal = signal(-1);
  private readonly maxSentenceNumberSignal = signal(0);
  private readonly replayOnSignal = signal(false);

  readonly currentSentence = this.currentSentenceSignal.asReadonly();
  readonly maxSentenceNumber = this.maxSentenceNumberSignal.asReadonly();
  readonly replayOn = this.replayOnSignal.asReadonly();

  private readonly domManipulationService = inject(DomManipulationService);
  private readonly storyCreatorService = inject(StoryCreatorService);
  private readonly snackbar = inject(MatSnackBar);
  private contextPad: any;
  private palette: any;
  private selection: any;

  setReplayState(state: boolean): void {
    this.replayOnSignal.set(state);
  }

  getReplayOn(): boolean {
    return this.replayOnSignal();
  }

  isReplayable(): boolean {
    return this.storyCreatorService.traceActivitiesAndCreateStory().length > 0;
  }

  initializeReplay(story: StorySentence[]): void {
    this.currentSentenceSignal.set(1);
    this.story = story;
    this.maxSentenceNumberSignal.set(this.story.length);
  }

  getCurrentSentenceNumber(): number {
    return this.currentSentenceSignal();
  }

  getMaxSentenceNumber(): number {
    return this.maxSentenceNumberSignal();
  }

  nextSentence(): void {
    if (this.currentSentenceSignal() < this.story.length) {
      this.currentSentenceSignal.set(this.currentSentenceSignal() + 1);
      this.showCurrentSentence();
    }
  }

  previousSentence(): void {
    if (this.currentSentenceSignal() > 1) {
      this.currentSentenceSignal.set(this.currentSentenceSignal() - 1);
      this.showCurrentSentence();
    }
  }

  private showCurrentSentence() {
    this.domManipulationService.showSentence(
      this.story[this.currentSentenceSignal() - 1],
      this.currentSentenceSignal() > 1
        ? this.story[this.currentSentenceSignal() - 2]
        : undefined,
    );
  }

  startReplay(checkSequenceNumbers = false): void {
    const story = this.storyCreatorService.traceActivitiesAndCreateStory();

    this.clearUserInteractionsOnCanvas();

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

    this.initializeReplay(story);
    if (this.story.length > 0) {
      this.setReplayState(true);
      this.domManipulationService.showSentence(
        this.story[this.currentSentenceSignal() - 1],
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
    this.currentSentenceSignal.set(-1);
    this.maxSentenceNumberSignal.set(0);
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
