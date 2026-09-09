import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedIconComponent } from './selected-icon.component';
import { SelectableIcon } from '../../domain/selectableIcon';
import { ElementTypes } from 'src/app/domain/entities/element-types';

const icon: SelectableIcon = {
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
      imports: [SelectedIconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedIconComponent);
    component = fixture.componentInstance;
    component.icon = icon;
    fixture.detectChanges();

    jest.spyOn(document, 'getElementById').mockReturnValue({
      src: '',
    } as unknown as HTMLElement);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
