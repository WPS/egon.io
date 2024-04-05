import { Injectable } from '@angular/core';
import { ReplayStateService } from 'src/app/Service/Replay/replay-state.service';
import { DomManipulationService } from 'src/app/Service/DomManipulation/dom-manipulation.service';
import { StoryStep } from 'src/app/Domain/Replay/storyStep';
import { StoryCreatorService } from './storyCreator/story-creator.service';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
} from '../../Domain/Common/constants';

@Injectable({
  providedIn: 'root',
})
export class ReplayService {
  private story: StoryStep[] = [];
  private currentStep = new BehaviorSubject(-1);
  private maxStepNumber = new BehaviorSubject(0);

  currentStep$ = this.currentStep.asObservable();
  maxStepNumber$ = this.maxStepNumber.asObservable();

  constructor(
    private replayStateService: ReplayStateService,
    private domManipulationService: DomManipulationService,
    private storyCreatorService: StoryCreatorService,
    private snackbar: MatSnackBar
  ) {}

  isReplayable(): boolean {
    return this.storyCreatorService.traceActivitiesAndCreateStory().length > 0;
  }

  initializeReplay(): void {
    this.currentStep.next(1);
    this.story = this.storyCreatorService.traceActivitiesAndCreateStory();
    this.maxStepNumber.next(this.story.length);
  }

  getCurrentStepNumber(): number {
    return this.currentStep.value;
  }

  getMaxStepNumber(): number {
    return this.maxStepNumber.value;
  }

  nextStep(): void {
    if (this.currentStep.value < this.story.length) {
      this.currentStep.next(this.currentStep.value + 1);
      this.showCurrentStep();
    }
  }

  previousStep(): void {
    if (this.currentStep.value > 1) {
      this.currentStep.next(this.currentStep.value - 1);
      this.showCurrentStep();
    }
  }

  private showCurrentStep() {
    this.domManipulationService.showStep(
      this.story[this.currentStep.value - 1],
      this.currentStep.value > 1
        ? this.story[this.currentStep.value - 2]
        : undefined
    );
  }

  startReplay(): void {
    this.initializeReplay();
    if (this.story?.length) {
      const missingSteps = this.storyCreatorService.getMissingSteps(this.story);
      if (missingSteps.length === 0) {
        this.replayStateService.setReplayState(true);
        this.domManipulationService.showStep(
          this.story[this.currentStep.getValue() - 1]
        );
      } else {
        const steps = missingSteps.join(', ');
        this.snackbar.open(
          steps.length === 1
            ? `The Domain Story is not complete. Step ${steps} is missing.`
            : `The Domain Story is not complete. Steps ${steps} are missing.`,
          undefined,
          {
            duration: SNACKBAR_DURATION * 2,
            panelClass: SNACKBAR_INFO,
          }
        );
      }
    } else {
      this.snackbar.open('You need a Domain Story for replay.', undefined, {
        duration: SNACKBAR_DURATION * 2,
        panelClass: SNACKBAR_INFO,
      });
    }
  }

  stopReplay(): void {
    this.currentStep.next(-1);
    this.maxStepNumber.next(0);
    this.replayStateService.setReplayState(false);
    this.domManipulationService.showAll();
  }
}
