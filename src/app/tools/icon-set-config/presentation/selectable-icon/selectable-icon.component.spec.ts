import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableIconComponent } from './selectable-icon.component';
import { MockModule, MockProvider } from 'ng-mocks';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { SelectableIcon } from '../../domain/selectableIcon';
import { BehaviorSubject } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';

describe('SelectableIconComponent', () => {
  let component: SelectableIconComponent;
  let fixture: ComponentFixture<SelectableIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [SelectableIconComponent],
      providers: [
        MockProvider(IconSetCustomizationService, {
          getIconForName: () => {
            return new BehaviorSubject<SelectableIcon>({} as SelectableIcon);
          },
        }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectableIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
