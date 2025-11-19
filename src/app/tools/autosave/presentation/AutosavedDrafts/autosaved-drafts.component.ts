import { Component, OnInit } from '@angular/core';
import { AutosaveService } from '../../services/autosave.service';
import { Draft } from '../../domain/draft';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_SUCCESS,
} from 'src/app/domain/entities/constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-autosaved-drafts',
  templateUrl: './autosaved-drafts.component.html',
  styleUrls: ['./autosaved-drafts.component.scss'],
  standalone: false,
})
export class AutosavedDraftsComponent implements OnInit {
  drafts: Draft[] = [];
  subscription: Subscription;

  constructor(
    private autosaveService: AutosaveService,
    private snackbar: MatSnackBar,
  ) {
    this.subscription = this.autosaveService.autosavedDraftsChanged$.subscribe(
      () => this.initDrafts(),
    );
  }

  ngOnInit(): void {
    this.initDrafts();
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
