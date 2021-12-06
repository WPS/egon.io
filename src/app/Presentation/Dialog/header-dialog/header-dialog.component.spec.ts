import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDialogComponent } from 'src/app/Presentation/Dialog/header-dialog/header-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MockModule, MockService } from 'ng-mocks';
import { FormBuilder } from '@angular/forms';
import { ReplayService } from '../../../Service/Replay/replay.service';

xdescribe('HeaderDialogComponent', () => {
  let component: HeaderDialogComponent;
  let fixture: ComponentFixture<HeaderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderDialogComponent],
      imports: [MockModule(MatDialogModule)],
      providers: [
        {
          provide: ReplayService,
          useValue: MockService(ReplayService),
        },
        {
          provide: FormBuilder,
        },
        {
          provide: MatDialogRef,
        },
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
