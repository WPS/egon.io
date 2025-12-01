import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedIconComponent } from './selected-icon.component';
import { IconListItem } from '../../domain/iconListItem';
import { ElementTypes } from '../../../../domain/entities/elementTypes';
import { MaterialModule } from '../../../../material.module';
import { MockModule } from 'ng-mocks';

const icon: IconListItem = {
  svg: '',
  isWorkObject: false,
  isActor: false,
  name: ElementTypes.ACTOR + 'testName',
};

describe('SelectedIconComponent', () => {
  let component: SelectedIconComponent;
  let fixture: ComponentFixture<SelectedIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectedIconComponent],
      imports: [MockModule(MaterialModule)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedIconComponent);
    component = fixture.componentInstance;
    component.icon = icon;
    fixture.detectChanges();

    spyOn(document, 'getElementById').and.returnValue({
      src: '',
    } as unknown as HTMLElement);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
