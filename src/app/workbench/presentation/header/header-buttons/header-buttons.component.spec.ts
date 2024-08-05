import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderButtonsComponent } from './header-buttons.component';
import { MockProviders } from 'ng-mocks';
import { SettingsService } from '../../../service/settings/settings.service';
import { TitleService } from '../../../../tool/header/service/title.service';
import { ModelerService } from '../../../../tool/modeler/service/modeler.service';
import { ReplayStateService } from '../../../../tool/replay/service/replay-state.service';
import { DirtyFlagService } from '../../../../domain/service/dirty-flag.service';
import { ElementRegistryService } from '../../../../domain/service/element-registry.service';
import { DialogService } from '../../../../domain/service/dialog.service';
import { ReplayService } from '../../../../tool/replay/service/replay.service';
import { ExportService } from '../../../../tool/export/service/export.service';
import { ImportDomainStoryService } from '../../../../tool/import/service/import-domain-story.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoryCreatorService } from '../../../../tool/replay/service/story-creator.service';
import { preBuildTestStory } from '../../../../utils/testHelpers.spec';

describe('HeaderButtonsComponent', () => {
  let component: HeaderButtonsComponent;
  let fixture: ComponentFixture<HeaderButtonsComponent>;

  let storyCreatorService: jasmine.SpyObj<StoryCreatorService>;
  let replayService: jasmine.SpyObj<ReplayService>;
  let snackbar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    storyCreatorService = jasmine.createSpyObj('StoryCreatorService', [
      'traceActivitiesAndCreateStory',
      'getMissingSentences',
    ]);
    storyCreatorService.traceActivitiesAndCreateStory.and.returnValue(
      preBuildTestStory(2),
    );

    replayService = jasmine.createSpyObj('replayService', [
      'startReplay',
      'stopReplay',
      'isReplayable',
    ]);
    replayService.isReplayable.and.returnValue(true);

    snackbar = jasmine.createSpyObj('snackbar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [HeaderButtonsComponent],
      providers: [
        { provide: StoryCreatorService, useValue: storyCreatorService },
        { provide: ReplayService, useValue: replayService },
        { provide: MatSnackBar, useValue: snackbar },
        MockProviders(
          SettingsService,
          TitleService,
          ModelerService,
          ReplayStateService,
          DirtyFlagService,
          ElementRegistryService,
          DialogService,
          ExportService,
          ImportDomainStoryService,
        ),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can start replay for consecutively numbered stories', () => {
    storyCreatorService.getMissingSentences.and.returnValue([]);
    component.startReplay();

    expect(storyCreatorService.getMissingSentences).toHaveBeenCalled();
    expect(replayService.startReplay).toHaveBeenCalled();
    expect(snackbar.open).not.toHaveBeenCalled();
  });

  it('cannot start replay for non-consecutively numbered stories', () => {
    storyCreatorService.getMissingSentences.and.returnValue([2]);
    component.startReplay();

    expect(storyCreatorService.getMissingSentences).toHaveBeenCalled();
    expect(replayService.startReplay).not.toHaveBeenCalled();
    expect(snackbar.open).toHaveBeenCalled();
  });
});
