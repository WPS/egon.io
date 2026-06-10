import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutosaveOptionsComponent } from './autosave-options.component';
import { AutosaveConfigurationService } from '../../services/autosave-configuration.service';

describe('AutosaveOptionsComponent', () => {
  let component: AutosaveOptionsComponent;
  let fixture: ComponentFixture<AutosaveOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutosaveOptionsComponent],
      providers: [
        {
          provide: AutosaveConfigurationService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosaveOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
