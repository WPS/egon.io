import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelerComponent } from 'src/app/Presentation/Canvas/modeler.component';
import { MockProviders } from 'ng-mocks';
import { ModelerService } from '../../Service/Modeler/modeler.service';
import { AutosaveService } from '../../Service/Autosave/autosave.service';

describe('ModelerComponent', () => {
  let component: ModelerComponent;
  let fixture: ComponentFixture<ModelerComponent>;

  let autosaveService: AutosaveService;

  beforeEach(async () => {
    autosaveService = jasmine.createSpyObj(AutosaveService.name, [
      AutosaveService.prototype.loadLatestDraft.name,
    ]);

    await TestBed.configureTestingModule({
      declarations: [ModelerComponent],
      providers: [
        MockProviders(ModelerService),
        {
          provide: AutosaveService,
          useValue: autosaveService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load latest draft', () => {
    expect(autosaveService.loadLatestDraft).toHaveBeenCalled();
  });
});
