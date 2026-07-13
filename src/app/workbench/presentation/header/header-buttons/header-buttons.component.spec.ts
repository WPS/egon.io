import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderButtonsComponent } from './header-buttons.component';
import { MockProviders, MockService } from 'ng-mocks';
import { SettingsService } from '../../../services/settings/settings.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { ModelerService } from '../../../../tools/modeler/services/modeler.service';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { ExportService } from '../../../../tools/export/services/export.service';
import { ImportDomainStoryService } from '../../../../tools/import/services/import-domain-story.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoryCreatorService } from '../../../../tools/replay/services/story-creator.service';
import { preBuildTestStory } from '../../../../utils/test-helpers';
import { signal } from '@angular/core';

describe('HeaderButtonsComponent', () => {
  let component: HeaderButtonsComponent;
  let fixture: ComponentFixture<HeaderButtonsComponent>;

  let storyCreatorService: jest.Mocked<StoryCreatorService>;
  let replayService: jest.Mocked<ReplayService>;
  let snackbar: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    storyCreatorService = MockService(
      StoryCreatorService,
    ) as jest.Mocked<StoryCreatorService>;
    storyCreatorService.traceActivitiesAndCreateStory.mockReturnValue(
      preBuildTestStory(2),
    );

    replayService = MockService(ReplayService, {
      currentSentence: signal(1),
      maxSentenceNumber: signal(2),
    }) as jest.Mocked<ReplayService>;
    replayService.isReplayable.mockReturnValue(true);

    snackbar = MockService(MatSnackBar) as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [HeaderButtonsComponent],
      providers: [
        { provide: StoryCreatorService, useValue: storyCreatorService },
        { provide: ReplayService, useValue: replayService },
        { provide: MatSnackBar, useValue: snackbar },
        MockProviders(
          SettingsService,
          PropertiesService,
          ModelerService,
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
});
