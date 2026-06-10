import { Component, inject } from '@angular/core';
import { AutosaveService } from '../../services/autosave.service';
import { Draft } from '../../domain/draft';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_SUCCESS,
} from 'src/app/domain/entities/constants';

import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-autosaved-drafts',
  templateUrl: './autosaved-drafts.component.html',
  styleUrls: ['./autosaved-drafts.component.scss'],

  imports: [MatButtonModule, MatListModule],
})
export class AutosavedDraftsComponent {
  private autosaveService = inject(AutosaveService);
  private snackbar = inject(MatSnackBar);

  drafts: Draft[] = this.autosaveService.getDrafts();

  constructor() {
    this.autosaveService.autosavedDraftsChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.initDrafts());
  }

  initDrafts() {
    this.drafts = this.autosaveService.getDrafts();
  }

  loadDraft(draft: Draft): void {
    this.autosaveService.loadDraft(draft);
    this.snackbar.open('Draft loaded', undefined, {
      duration: SNACKBAR_DURATION,
      panelClass: SNACKBAR_SUCCESS,
    });
  }

  removeAllDrafts() {
    this.autosaveService.removeAllDrafts();
  }
}
