import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDialogComponent } from 'src/app/Presentation/Dialog/header-dialog/header-dialog.component';
import { MockModule, MockProviders, MockService } from 'ng-mocks';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ReplayService } from '../../../Service/Replay/replay.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';

describe('HeaderDialogComponent', () => {
  let component: HeaderDialogComponent;
  let fixture: ComponentFixture<HeaderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderDialogComponent],
      imports: [MockModule(MaterialModule), ReactiveFormsModule],
      providers: [
        {
          provide: ReplayService,
          useValue: MockService(ReplayService),
        },
        {
          provide: UntypedFormBuilder,
        },
        MockProviders(MatDialog, MatDialogRef),
        UntypedFormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
