import { ReplayService } from './replay.service';
import { StoryCreatorService } from './story-creator.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { preBuildTestStory } from '../../../utils/testHelpers.spec';
import { DomManipulationService } from './dom-manipulation.service';

describe(ReplayService.name, () => {
  let service: ReplayService;

  let storyCreatorService: jasmine.SpyObj<StoryCreatorService>;
  let domManipulationService: jasmine.SpyObj<DomManipulationService>;
  let snackbar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    storyCreatorService = jasmine.createSpyObj('StoryCreatorService', [
      'traceActivitiesAndCreateStory',
      'getMissingSentences',
    ]);
    storyCreatorService.traceActivitiesAndCreateStory.and.returnValue(
      preBuildTestStory(2),
    );

    domManipulationService = jasmine.createSpyObj('domManipulationService', [
      'showSentence',
    ]);

    snackbar = jasmine.createSpyObj('snackbar', ['open']);

    service = new ReplayService(
      domManipulationService,
      storyCreatorService,
      snackbar,
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return value', () => {
    expect(service.getReplayOn()).toBeFalse();
  });

  it('should return Observable', () => {
    service.replayOn$.subscribe((value) => expect(value).toBeFalse());
  });

  it('should set value', () => {
    service.setReplayState(true);
    expect(service.getReplayOn()).toBeTrue();
  });

  describe('with checkSequenceNumbers = true', () => {
    const checkSequenceNumbers = true;
    it('can start replay for consecutively numbered stories', () => {
      storyCreatorService.getMissingSentences.and.returnValue([]);
      service.startReplay(checkSequenceNumbers);

      expect(storyCreatorService.getMissingSentences).toHaveBeenCalled();
      expect(snackbar.open).not.toHaveBeenCalled();
    });

    it('cannot start replay for non-consecutively numbered stories', () => {
      storyCreatorService.getMissingSentences.and.returnValue([2]);
      service.startReplay(checkSequenceNumbers);

      expect(storyCreatorService.getMissingSentences).toHaveBeenCalled();
      expect(snackbar.open).toHaveBeenCalled();
    });
  });

  describe('with checkSequenceNumbers = false', () => {
    const checkSequenceNumbers = false;
    it('can start replay for consecutively numbered stories', () => {
      storyCreatorService.getMissingSentences.and.returnValue([]);
      service.startReplay(checkSequenceNumbers);

      expect(storyCreatorService.getMissingSentences).not.toHaveBeenCalled();
      expect(snackbar.open).not.toHaveBeenCalled();
    });

    it('cannot start replay for non-consecutively numbered stories', () => {
      storyCreatorService.getMissingSentences.and.returnValue([2]);
      service.startReplay(checkSequenceNumbers);

      expect(storyCreatorService.getMissingSentences).not.toHaveBeenCalled();
      expect(snackbar.open).not.toHaveBeenCalled();
    });
  });
});
