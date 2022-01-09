import { ComponentFixture, TestBed } from '@angular/core/testing';

import {ModelerComponent} from 'src/app/Presentation/Canvas/modeler.component';
import { MockProvider } from 'ng-mocks';
import { ModelerService } from '../../Service/Modeler/modeler.service';
import { EMPTY } from 'rxjs';
import { AutosaveService } from '../../Service/Autosave/autosave.service';

describe('ModelerComponent', () => {
  let component: ModelerComponent;
  let fixture: ComponentFixture<ModelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModelerComponent],
      providers: [MockProvider(ModelerService, {
          getModelerUpdatedAsObservable: () => EMPTY,
        }),
        MockProvider(AutosaveService)
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
});
