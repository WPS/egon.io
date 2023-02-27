import { Injectable } from '@angular/core';
import { ReplayStateService } from 'src/app/Service/Replay/replay-state.service';
import { DomManipulationService } from 'src/app/Service/DomManipulation/dom-manipulation.service';
import { StoryStep } from 'src/app/Domain/Replay/storyStep';
import { StoryCreatorService } from './storyCreator/story-creator.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_WARNING,
} from '../../Domain/Common/constants';

@Injectable({
  providedIn: 'root',
})
export class ReplayService {
  private story: StoryStep[] = [];
  private currentStep = new BehaviorSubject(-1);
  private maxStepNumber = new BehaviorSubject(0);

  constructor(
    private replayStateService: ReplayStateService,
    private domManipulationService: DomManipulationService,
    private storyCreatorService: StoryCreatorService,
    public snackbar: MatSnackBar
  ) {}

  public initializeReplay(): void {
    this.currentStep.next(1);
    this.story = this.storyCreatorService.traceActivitiesAndCreateStory();
    this.maxStepNumber.next(this.story.length);
  }

  public getCurrentStepNumberObservable(): Observable<number> {
    return this.currentStep.asObservable();
  }

  public getMaxStepNumberObservable(): Observable<number> {
    return this.maxStepNumber.asObservable();
  }

  public getCurrentStepNumber(): number {
    return this.currentStep.getValue();
  }

  public getMaxStepNumber(): number {
    return this.maxStepNumber.getValue();
  }

  public nextStep(): void {
    if (
      this.story.length > 0 &&
      this.story.length > this.currentStep.getValue()
    ) {
      this.currentStep.next(this.currentStep.getValue() + 1);
      this.domManipulationService.showStep(
        this.story[this.currentStep.getValue() - 1],
        this.currentStep.getValue() > 0
          ? this.story[this.currentStep.getValue() - 2]
          : undefined
      );
    }
  }

  public previousStep(): void {
    if (this.currentStep.getValue() > 1) {
      this.currentStep.next(this.currentStep.getValue() - 1);
      this.domManipulationService.showStep(
        this.story[this.currentStep.getValue() - 1],
        this.currentStep.getValue() > 0
          ? this.story[this.currentStep.getValue() - 2]
          : undefined
      );
    }
  }

  public startReplay(): void {
    this.initializeReplay();
    if (this.storyCreatorService.isStoryConsecutivelyNumbered(this.story)) {
      this.replayStateService.setReplayState(true);
      this.domManipulationService.showStep(
        this.story[this.currentStep.getValue() - 1]
      );
    } else {
      this.snackbar.open(
        'The Domain Story is not complete. At least one Step is missing.',
        undefined,
        {
          duration: SNACKBAR_DURATION * 2,
          panelClass: SNACKBAR_WARNING,
        }
      );
    }
  }

  public stopReplay(): void {
    this.currentStep.next(-1);
    this.maxStepNumber.next(0);
    this.replayStateService.setReplayState(false);
    this.domManipulationService.showAll();
  }
}
