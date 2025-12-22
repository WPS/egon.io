import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosavedDraftsComponent } from './autosaved-drafts.component';
import { AutosaveService } from '../../services/autosave.service';
import { AutosaveConfigurationService } from '../../services/autosave-configuration.service';
import { of } from 'rxjs';

describe('AutosavedDraftsComponent', () => {
  let component: AutosavedDraftsComponent;
  let fixture: ComponentFixture<AutosavedDraftsComponent>;
  let autosaveServiceSpy: jasmine.SpyObj<AutosaveService>;

  const autosaveConfigurationServiceMock = jasmine.createSpyObj(
    'AutosaveConfigurationService',
    ['setConfiguration'],
    { configuration$: of({ activated: true, maxDrafts: 1, interval: 1 }) },
  );

  const autosaveServiceMock = jasmine.createSpyObj(
    'AutosaveService',
    ['getDrafts', 'loadDraft', 'removeAllDrafts'],
    { autosavedDraftsChanged$: of() },
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutosavedDraftsComponent],
      providers: [
        {
          provide: AutosaveService,
          useValue: autosaveServiceMock,
        },
        {
          provide: AutosaveConfigurationService,
          useValue: autosaveConfigurationServiceMock,
        },
      ],
    }).compileComponents();

    autosaveServiceSpy = TestBed.inject(
      AutosaveService,
    ) as jasmine.SpyObj<AutosaveService>;
    autosaveServiceSpy.getDrafts.and.returnValue([]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosavedDraftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
