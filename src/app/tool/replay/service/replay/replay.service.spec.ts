import { TestBed } from '@angular/core/testing';

import { ReplayService } from 'src/app/tool/replay/service/replay/replay.service';
import { ReplayStateService } from './replay-state.service';
import { DomManipulationService } from '../../../../Service/DomManipulation/dom-manipulation.service';
import { DialogService } from '../../../../Service/Dialog/dialog.service';
import { StoryCreatorService } from './story-creator.service';
import { preBuildTestStory } from '../../../../Utils/testHelpers.spec';
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
      ['traceActivitiesAndCreateStory', 'getMissingSentences'],
    );
    const domManipulationServiceMock = jasmine.createSpyObj(
      'DomManipulationService',
      ['showSentence', 'showAll'],
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
      StoryCreatorService,
    ) as jasmine.SpyObj<StoryCreatorService>;
    domManipulationServiceSpy = TestBed.inject(
      DomManipulationService,
    ) as jasmine.SpyObj<DomManipulationService>;
    dialogServiceSpy = TestBed.inject(
      DialogService,
    ) as jasmine.SpyObj<DialogService>;
    replayStateServiceSpy = TestBed.inject(
      ReplayStateService,
    ) as jasmine.SpyObj<ReplayStateService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial currentSentenceNumber', () => {
    service.currentSentence$.subscribe((value) => expect(value).toEqual(-1));
  });

  it('should return initial maxSentenceNumber', () => {
    service.maxSentenceNumber$.subscribe((value) => expect(value).toEqual(0));
  });

  describe('initializeReplay', () => {
    beforeEach(() => {
      storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
        preBuildTestStory(1),
      );
    });

    it('should initialize Replay', () => {
      service.initializeReplay();

      service.currentSentence$.subscribe((value) => expect(value).toEqual(1));
      service.maxSentenceNumber$.subscribe((value) => expect(value).toEqual(1));
      expect(
        storyCreatorServiceSpy.traceActivitiesAndCreateStory,
      ).toHaveBeenCalled();
    });
  });

  describe('should sentence through', () => {
    beforeEach(() => {
      storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
        preBuildTestStory(2),
      );
      domManipulationServiceSpy.showSentence.and.returnValue();
    });

    describe('nextSentence ', () => {
      it('should select next sentence', () => {
        service.initializeReplay();
        service.nextSentence();

        service.currentSentence$.subscribe((value) => {
          expect(value).toEqual(2);
        });
        expect(domManipulationServiceSpy.showSentence).toHaveBeenCalled();
      });

      it('should not select next sentence when last sentence', () => {
        service.initializeReplay();
        service.nextSentence();

        service.currentSentence$.subscribe((value) => {
          expect(value).toEqual(2);
        });
        service.nextSentence();

        service.currentSentence$.subscribe((value) => {
          expect(value).toEqual(2);
        });
        expect(domManipulationServiceSpy.showSentence).toHaveBeenCalledTimes(1);
      });
    });

    describe('previousSentence', () => {
      it('should not select previous sentence when no story', () => {
        service.previousSentence();

        service.currentSentence$.subscribe((value) => {
          expect(value).toEqual(-1);
        });
        expect(domManipulationServiceSpy.showSentence).toHaveBeenCalledTimes(0);
      });

      it('should select previous sentence', () => {
        service.initializeReplay();
        service.nextSentence();

        service.previousSentence();

        service.currentSentence$.subscribe((value) => {
          expect(value).toEqual(1);
        });
        expect(domManipulationServiceSpy.showSentence).toHaveBeenCalled();
      });

      it('should not select previous sentence when first sentence', () => {
        service.initializeReplay();
        service.previousSentence();

        service.currentSentence$.subscribe((value) => {
          expect(value).toEqual(1);
        });
        expect(domManipulationServiceSpy.showSentence).toHaveBeenCalledTimes(0);
      });
    });

    describe('startReplay', () => {
      beforeEach(() => {
        storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
          preBuildTestStory(1),
        );
        domManipulationServiceSpy.showSentence.and.returnValue();
        dialogServiceSpy.openDialog.and.returnValue();
        replayStateServiceSpy.setReplayState.and.returnValue();
      });

      it('should show dialog if not consecutively numbered', () => {
        storyCreatorServiceSpy.getMissingSentences.and.returnValue([1]);

        service.startReplay();

        expect(storyCreatorServiceSpy.getMissingSentences).toHaveBeenCalled();
        expect(snackBarSpy.open).toHaveBeenCalled();
      });

      it(' should start replay if consecutively numbered', () => {
        storyCreatorServiceSpy.getMissingSentences.and.returnValue([]);

        service.startReplay();

        expect(storyCreatorServiceSpy.getMissingSentences).toHaveBeenCalled();
        expect(replayStateServiceSpy.setReplayState).toHaveBeenCalledOnceWith(
          true,
        );
        expect(domManipulationServiceSpy.showSentence).toHaveBeenCalled();
      });
    });

    describe('stopReplay', () => {
      beforeEach(() => {
        dialogServiceSpy.openDialog.and.returnValue();
        replayStateServiceSpy.setReplayState.and.returnValue();
        storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
          preBuildTestStory(1),
        );
        domManipulationServiceSpy.showSentence.and.returnValue();
        replayStateServiceSpy.setReplayState.and.returnValue();
        storyCreatorServiceSpy.getMissingSentences.and.returnValue([]);

        service.startReplay();
      });

      it('should call methods', () => {
        service.stopReplay();

        service.currentSentence$.subscribe((value) =>
          expect(value).toEqual(-1),
        );
        service.maxSentenceNumber$.subscribe((value) =>
          expect(value).toEqual(0),
        );

        expect(replayStateServiceSpy.setReplayState).toHaveBeenCalledWith(true);
        expect(replayStateServiceSpy.setReplayState).toHaveBeenCalledWith(
          false,
        );
        expect(domManipulationServiceSpy.showAll).toHaveBeenCalled();
      });
    });
  });
});
