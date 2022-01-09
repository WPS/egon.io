import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelerComponent } from 'src/app/Presentation/Canvas/modeler.component';
import { MockProvider } from 'ng-mocks';
import { ModelerService } from '../../Service/Modeler/modeler.service';
import { EMPTY } from 'rxjs';
import { SaveStateService } from '../../Service/SaveState/save-state.service';

describe('ModelerComponent', () => {
  let component: ModelerComponent;
  let fixture: ComponentFixture<ModelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModelerComponent],
      providers: [MockProvider(ModelerService, {
          getModelerUpdatedAsObservable: () => EMPTY,
        }),
        MockProvider(SaveStateService)
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

  // TODO: Test creating and loading save state

});
