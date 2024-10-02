import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardShortcutsDialogComponent } from './keyboard-shortcuts-dialog.component';

describe('KeyboardShortcutsComponent', () => {
  let component: KeyboardShortcutsDialogComponent;
  let fixture: ComponentFixture<KeyboardShortcutsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyboardShortcutsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyboardShortcutsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
