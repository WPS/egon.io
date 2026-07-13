import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosavedDraftsComponent } from './autosaved-drafts.component';
import { AutosaveService } from '../../services/autosave.service';
import { AutosaveConfigurationService } from '../../services/autosave-configuration.service';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('AutosavedDraftsComponent', () => {
  let component: AutosavedDraftsComponent;
  let fixture: ComponentFixture<AutosavedDraftsComponent>;
  let autosaveServiceSpy: jest.Mocked<AutosaveService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutosavedDraftsComponent],
      providers: [
        MockProvider(AutosaveService, { autosavedDraftsChanged$: of() }),
        MockProvider(AutosaveConfigurationService, {
          configuration: signal({ activated: true, maxDrafts: 1, interval: 1 }),
        }),
      ],
    }).compileComponents();

    autosaveServiceSpy = TestBed.inject(
      AutosaveService,
    ) as jest.Mocked<AutosaveService>;
    autosaveServiceSpy.getDrafts.mockReturnValue([]);
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
