import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosavesListComponent } from './autosaves-list.component';
import { MockModule, MockProviders, MockService } from 'ng-mocks';
import { AutosaveService } from '../../Service/Autosave/autosave.service';
import { AutosaveStateService } from '../../Service/Autosave/autosave-state.service';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('AutosaveListComponent', () => {
  let component: AutosavesListComponent;
  let fixture: ComponentFixture<AutosavesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [AutosavesListComponent],
      providers: [
        {
          provide: AutosaveService,
          useValue: MockService(AutosaveService),
        },
        {
          provide: AutosaveStateService,
        },
        MockProviders(MatSnackBar)
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosavesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
