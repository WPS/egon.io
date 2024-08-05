import { Injectable } from '@angular/core';
import { ReplayStateService } from 'src/app/tools/replay/service/replay-state.service';
import { DomManipulationService } from 'src/app/tools/replay/service/dom-manipulation.service';
import { StorySentence } from 'src/app/tools/replay/domain/storySentence';
import { StoryCreatorService } from './story-creator.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
} from '../../../domain/entity/common/constants';

@Injectable({
  providedIn: 'root',
})
export class ReplayService {
  private story: StorySentence[] = [];
  private currentSentence = new BehaviorSubject<number>(-1);
  private maxSentenceNumber = new BehaviorSubject<number>(0);

  currentSentence$: Observable<number> = this.currentSentence.asObservable();
  maxSentenceNumber$: Observable<number> =
    this.maxSentenceNumber.asObservable();

  constructor(
    private replayStateService: ReplayStateService,
    private domManipulationService: DomManipulationService,
    private storyCreatorService: StoryCreatorService,
    private snackbar: MatSnackBar,
  ) {}

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

  startReplay(story: StorySentence[]): void {
    this.initializeReplay(story);
    if (this.story.length > 0) {
      this.replayStateService.setReplayState(true);
      this.domManipulationService.showSentence(
        this.story[this.currentSentence.getValue() - 1],
      );
    } else {
      this.snackbar.open('You need a Domain Story for replay.', undefined, {
        duration: SNACKBAR_DURATION * 2,
        panelClass: SNACKBAR_INFO,
      });
    }
  }

  stopReplay(): void {
    this.currentSentence.next(-1);
    this.maxSentenceNumber.next(0);
    this.replayStateService.setReplayState(false);
    this.domManipulationService.showAll();
  }
}
