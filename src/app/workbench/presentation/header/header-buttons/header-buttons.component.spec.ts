import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderButtonsComponent } from './header-buttons.component';
import { MockProviders } from 'ng-mocks';
import { SettingsService } from '../../../service/settings/settings.service';
import { TitleService } from '../../../../Service/Title/title.service';
import { ModelerService } from '../../../../Service/Modeler/modeler.service';
import { ReplayStateService } from '../../../../Service/Replay/replay-state.service';
import { DirtyFlagService } from '../../../../Service/DirtyFlag/dirty-flag.service';
import { ElementRegistryService } from '../../../../Service/ElementRegistry/element-registry.service';
import { DialogService } from '../../../../Service/Dialog/dialog.service';
import { ReplayService } from '../../../../Service/Replay/replay.service';
import { ExportService } from '../../../../Service/Export/export.service';
import { ImportDomainStoryService } from '../../../../Service/Import/import-domain-story.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('HeaderButtonsComponent', () => {
  let component: HeaderButtonsComponent;
  let fixture: ComponentFixture<HeaderButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderButtonsComponent],
      providers: [
        MockProviders(
          SettingsService,
          TitleService,
          ModelerService,
          ReplayStateService,
          DirtyFlagService,
          ElementRegistryService,
          DialogService,
          ReplayService,
          ExportService,
          ImportDomainStoryService,
          MatSnackBar,
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
