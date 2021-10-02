import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from 'src/app/settings-module/component/settings.component';
import { SettingsService } from '../service/settings.service';
import { MockService } from 'ng-mocks';
import { ModelerService } from '../../modeler/service/modeler.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [
        {
          provide: SettingsService,
          useValue: MockService(SettingsService),
        },
        {
          provide: ModelerService,
          useValue: MockService(ModelerService),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
