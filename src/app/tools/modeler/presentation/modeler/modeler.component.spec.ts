import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelerComponent } from 'src/app/tools/modeler/presentation/modeler/modeler.component';
import { MockProviders } from 'ng-mocks';
import { ModelerService } from '../../services/modeler.service';
import { AutosaveService } from '../../../autosave/services/autosave.service';

describe('ModelerComponent', () => {
  let component: ModelerComponent;
  let fixture: ComponentFixture<ModelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModelerComponent],
      providers: [MockProviders(ModelerService)],
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
