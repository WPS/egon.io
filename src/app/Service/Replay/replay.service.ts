import {Injectable} from '@angular/core';
import {ReplayStateService} from 'src/app/Service/Replay/replay-state.service';
import {DomManipulationService} from 'src/app/Service/DomManipulation/dom-manipulation.service';
import {DialogService} from 'src/app/Service/Dialog/dialog.service';
import {InfoDialogComponent} from 'src/app/Presentation/Dialog/confirm-dialog/info-dialog.component';
import {MatDialogConfig} from '@angular/material/dialog';
import {InfoDialogData} from 'src/app/Presentation/Dialog/confirm-dialog/infoDialogData';
import {StoryStep} from 'src/app/Domain/Replay/storyStep';
import {StoryCreatorService} from './storyCreator/story-creator.service';
import {BehaviorSubject, Observable} from 'rxjs';

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
    private dialogService: DialogService,
    private storyCreatorService: StoryCreatorService
  ) {
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

  public initializeReplay(): void {
    this.currentStep.next(1);
    this.story = this.storyCreatorService.traceActivitiesAndCreateStory();
    this.maxStepNumber.next(this.story.length);
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
      const title = 'Replay Error';
      const text =
        'The Domain Story is not complete.\n' + 'At least one Step is missing.';

      const config = new MatDialogConfig();
      config.disableClose = false;
      config.autoFocus = true;

      config.data = new InfoDialogData(title, text, true);

      this.dialogService.openDialog(InfoDialogComponent, config);
    }
  }

  public stopReplay(): void {
    this.currentStep.next(-1);
    this.maxStepNumber.next(0);
    this.replayStateService.setReplayState(false);
    this.domManipulationService.showAll();
  }
}
