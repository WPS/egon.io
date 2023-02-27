import { TestBed } from '@angular/core/testing';

import { ReplayService } from 'src/app/Service/Replay/replay.service';
import { ReplayStateService } from './replay-state.service';
import { DomManipulationService } from '../DomManipulation/dom-manipulation.service';
import { DialogService } from '../Dialog/dialog.service';
import { StoryCreatorService } from './storyCreator/story-creator.service';
import { preBuildTestStory } from '../../Utils/testHelpers.spec';
import { MockProvider } from 'ng-mocks';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

describe('ReplayService', () => {
  let service: ReplayService;

  let storyCreatorServiceSpy: jasmine.SpyObj<StoryCreatorService>;
  let domManipulationServiceSpy: jasmine.SpyObj<DomManipulationService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let replayStateServiceSpy: jasmine.SpyObj<ReplayStateService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const storyCreatorServiceMock = jasmine.createSpyObj(
      'StoryCreatorService',
      ['traceActivitiesAndCreateStory', 'isStoryConsecutivelyNumbered']
    );
    const domManipulationServiceMock = jasmine.createSpyObj(
      'DomManipulationService',
      ['showStep', 'showAll']
    );
    const dialogServiceMock = jasmine.createSpyObj('dialogService', [
      'openDialog',
    ]);
    const replayStateServiceMock = jasmine.createSpyObj('replayState', [
      'setReplayState',
    ]);
    const snackBarMock = jasmine.createSpyObj('snackbar', ['open']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ReplayStateService,
          useValue: replayStateServiceMock,
        },
        {
          provide: DomManipulationService,
          useValue: domManipulationServiceMock,
        },
        {
          provide: DialogService,
          useValue: dialogServiceMock,
        },
        {
          provide: StoryCreatorService,
          useValue: storyCreatorServiceMock,
        },
        {
          provide: MatSnackBar,
          useValue: snackBarMock,
        },
        MockProvider(MatDialog),
      ],
    });
    service = TestBed.inject(ReplayService);

    storyCreatorServiceSpy = TestBed.inject(
      StoryCreatorService
    ) as jasmine.SpyObj<StoryCreatorService>;
    domManipulationServiceSpy = TestBed.inject(
      DomManipulationService
    ) as jasmine.SpyObj<DomManipulationService>;
    dialogServiceSpy = TestBed.inject(
      DialogService
    ) as jasmine.SpyObj<DialogService>;
    replayStateServiceSpy = TestBed.inject(
      ReplayStateService
    ) as jasmine.SpyObj<ReplayStateService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial currentStepNumber', () => {
    service
      .currentStep$
      .subscribe((value) => expect(value).toEqual(-1));
  });

  it('should return initial maxStepNumber', () => {
    service
      .maxStepNumber$
      .subscribe((value) => expect(value).toEqual(0));
  });

  describe('initializeReplay', () => {
    beforeEach(() => {
      storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
        preBuildTestStory(1)
      );
    });

    it('should initialize Replay', () => {
      service.initializeReplay();

      service
        .currentStep$
        .subscribe((value) => expect(value).toEqual(1));
      service
        .maxStepNumber$
        .subscribe((value) => expect(value).toEqual(1));
      expect(
        storyCreatorServiceSpy.traceActivitiesAndCreateStory
      ).toHaveBeenCalled();
    });
  });

  describe('should step through', () => {
    beforeEach(() => {
      storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
        preBuildTestStory(2)
      );
      domManipulationServiceSpy.showStep.and.returnValue();
    });

    describe('nextStep ', () => {
      it('should select next step', () => {
        service.initializeReplay();
        service.nextStep();

        service.currentStep$.subscribe((value) => {
          expect(value).toEqual(2);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalled();
      });

      it('should not select next step when last step', () => {
        service.initializeReplay();
        service.nextStep();

        service.currentStep$.subscribe((value) => {
          expect(value).toEqual(2);
        });
        service.nextStep();

        service.currentStep$.subscribe((value) => {
          expect(value).toEqual(2);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalledTimes(1);
      });
    });

    describe('previousStep', () => {
      it('should not select previous step when no story', () => {
        service.previousStep();

        service.currentStep$.subscribe((value) => {
          expect(value).toEqual(-1);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalledTimes(0);
      });

      it('should select previous step', () => {
        service.initializeReplay();
        service.nextStep();

        service.previousStep();

        service.currentStep$.subscribe((value) => {
          expect(value).toEqual(1);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalled();
      });

      it('should not select previous step when first step', () => {
        service.initializeReplay();
        service.previousStep();

        service.currentStep$.subscribe((value) => {
          expect(value).toEqual(1);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalledTimes(0);
      });
    });

    describe('startReplay', () => {
      beforeEach(() => {
        storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
          preBuildTestStory(1)
        );
        domManipulationServiceSpy.showStep.and.returnValue();
        dialogServiceSpy.openDialog.and.returnValue();
        replayStateServiceSpy.setReplayState.and.returnValue();
      });

      it('should show dialog if not consecutively numbered', () => {
        storyCreatorServiceSpy.isStoryConsecutivelyNumbered.and.returnValue(
          false
        );

        service.startReplay();

        expect(
          storyCreatorServiceSpy.isStoryConsecutivelyNumbered
        ).toHaveBeenCalled();
        expect(snackBarSpy.open).toHaveBeenCalled();
      });

      it(' should start replay if consecutively numbered', () => {
        storyCreatorServiceSpy.isStoryConsecutivelyNumbered.and.returnValue(
          true
        );

        service.startReplay();

        expect(
          storyCreatorServiceSpy.isStoryConsecutivelyNumbered
        ).toHaveBeenCalled();
        expect(replayStateServiceSpy.setReplayState).toHaveBeenCalledOnceWith(
          true
        );
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalled();
      });
    });

    describe('stopReplay', () => {
      beforeEach(() => {
        dialogServiceSpy.openDialog.and.returnValue();
        replayStateServiceSpy.setReplayState.and.returnValue();
        storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
          preBuildTestStory(1)
        );
        domManipulationServiceSpy.showStep.and.returnValue();
        replayStateServiceSpy.setReplayState.and.returnValue();
        storyCreatorServiceSpy.isStoryConsecutivelyNumbered.and.returnValue(
          true
        );

        service.startReplay();
      });

      it('should call methods', () => {
        service.stopReplay();

        service
          .currentStep$
          .subscribe((value) => expect(value).toEqual(-1));
        service
          .maxStepNumber$
          .subscribe((value) => expect(value).toEqual(0));

        expect(replayStateServiceSpy.setReplayState).toHaveBeenCalledWith(true);
        expect(replayStateServiceSpy.setReplayState).toHaveBeenCalledWith(
          false
        );
        expect(domManipulationServiceSpy.showAll).toHaveBeenCalled();
      });
    });
  });
});
