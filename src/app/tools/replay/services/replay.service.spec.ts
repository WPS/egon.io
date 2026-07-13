import { ReplayService } from './replay.service';
import { StoryCreatorService } from './story-creator.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { preBuildTestStory } from '../../../utils/test-helpers';
import { DomManipulationService } from './dom-manipulation.service';
import { TestBed } from '@angular/core/testing';
import { MockService } from 'ng-mocks';

describe(ReplayService.name, () => {
  let service: ReplayService;

  let storyCreatorService: jest.Mocked<StoryCreatorService>;
  let domManipulationService: jest.Mocked<DomManipulationService>;
  let snackbar: jest.Mocked<MatSnackBar>;

  const contextPadSpy = { close: jest.fn() };
  const paletteSpy = { close: jest.fn(), open: jest.fn() };
  const selectionSpy = { deselect: jest.fn(), _selectedElements: ['test'] };

  beforeEach(() => {
    storyCreatorService = MockService(
      StoryCreatorService,
    ) as jest.Mocked<StoryCreatorService>;
    storyCreatorService.traceActivitiesAndCreateStory.mockReturnValue(
      preBuildTestStory(2),
    );

    domManipulationService = MockService(
      DomManipulationService,
    ) as jest.Mocked<DomManipulationService>;

    snackbar = MockService(MatSnackBar) as jest.Mocked<MatSnackBar>;

    TestBed.configureTestingModule({
      providers: [
        ReplayService,
        { provide: DomManipulationService, useValue: domManipulationService },
        { provide: StoryCreatorService, useValue: storyCreatorService },
        { provide: MatSnackBar, useValue: snackbar },
      ],
    });

    service = TestBed.inject(ReplayService);
    service.setModelerContext(contextPadSpy, paletteSpy, selectionSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return value', () => {
    expect(service.replayOn()).toBe(false);
  });

  it('should return Observable', () => {
    expect(service.replayOn()).toBeFalsy();
  });

  it('should set value', () => {
    service.setReplayState(true);
    expect(service.replayOn()).toBe(true);
  });

  describe('with checkSequenceNumbers = true', () => {
    const checkSequenceNumbers = true;
    it('can start replay for consecutively numbered stories', () => {
      storyCreatorService.getMissingSentences.mockReturnValue([]);
      service.startReplay(checkSequenceNumbers);

      expect(storyCreatorService.getMissingSentences).toHaveBeenCalled();
      expect(snackbar.open).not.toHaveBeenCalled();

      expect(contextPadSpy.close).toHaveBeenCalled();
      expect(paletteSpy.close).toHaveBeenCalled();
      expect(selectionSpy.deselect).toHaveBeenCalledWith('test');
    });

    it('cannot start replay for non-consecutively numbered stories', () => {
      storyCreatorService.getMissingSentences.mockReturnValue([2]);
      service.startReplay(checkSequenceNumbers);

      expect(storyCreatorService.getMissingSentences).toHaveBeenCalled();
      expect(snackbar.open).toHaveBeenCalled();
    });
  });

  describe('with checkSequenceNumbers = false', () => {
    const checkSequenceNumbers = false;
    it('can start replay for consecutively numbered stories', () => {
      storyCreatorService.getMissingSentences.mockReturnValue([]);
      service.startReplay(checkSequenceNumbers);

      expect(storyCreatorService.getMissingSentences).not.toHaveBeenCalled();
      expect(snackbar.open).not.toHaveBeenCalled();

      expect(contextPadSpy.close).toHaveBeenCalled();
      expect(paletteSpy.close).toHaveBeenCalled();
      expect(selectionSpy.deselect).toHaveBeenCalledWith('test');
    });

    it('cannot start replay for non-consecutively numbered stories', () => {
      storyCreatorService.getMissingSentences.mockReturnValue([2]);
      service.startReplay(checkSequenceNumbers);

      expect(storyCreatorService.getMissingSentences).not.toHaveBeenCalled();
      expect(snackbar.open).not.toHaveBeenCalled();
    });
  });
});
