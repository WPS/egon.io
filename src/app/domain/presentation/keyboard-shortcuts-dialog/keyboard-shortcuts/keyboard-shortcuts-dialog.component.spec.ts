import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardShortcutsDialogComponent } from './keyboard-shortcuts-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MockModule, MockProviders } from 'ng-mocks';
import { ShortcutDialogData } from '../../../entities/shortcut-dialog-data';

describe('KeyboardShortcutsComponent', () => {
  let component: KeyboardShortcutsDialogComponent;
  let fixture: ComponentFixture<KeyboardShortcutsDialogComponent>;

  const keyboardShortCutData: ShortcutDialogData = {
    title: 'Keyboard Shortcuts',
    shortCuts: [{ description: 'Undo', shortCut: 'ctrl + Z' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KeyboardShortcutsDialogComponent],
      imports: [MockModule(MatDialogModule)],
      providers: [
        MockProviders(MatDialogRef),
        {
          provide: MAT_DIALOG_DATA,
          useValue: keyboardShortCutData,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KeyboardShortcutsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should have correct shortcut data', () => {
    expect(component.shortCuts.length).toBe(1);
    expect(component.shortCuts[0].shortCut).toBe('ctrl + Z');
    expect(component.shortCuts[0].description).toBe('Undo');
  });
});
