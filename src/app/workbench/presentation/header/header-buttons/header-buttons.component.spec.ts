import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderButtonsComponent } from './header-buttons.component';
import { MockProviders } from 'ng-mocks';
import { SettingsService } from '../../../services/settings/settings.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { ModelerService } from '../../../../tools/modeler/services/modeler.service';
import { DirtyFlagService } from '../../../../domain/services/dirty-flag.service';
import { ElementRegistryService } from '../../../../domain/services/element-registry.service';
import { DialogService } from '../../../../domain/services/dialog.service';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { ExportService } from '../../../../tools/export/services/export.service';
import { ImportDomainStoryService } from '../../../../tools/import/services/import-domain-story.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoryCreatorService } from '../../../../tools/replay/services/story-creator.service';
import { preBuildTestStory } from '../../../../utils/testHelpers.spec';
import { signal } from '@angular/core';

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

    replayService = jasmine.createSpyObj(
      'replayService',
      ['startReplay', 'stopReplay', 'isReplayable'],
      {
        currentSentence: signal(1),
        maxSentenceNumber: signal(2),
      },
    );
    replayService.isReplayable.and.returnValue(true);

    snackbar = jasmine.createSpyObj('snackbar', ['open']);

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
