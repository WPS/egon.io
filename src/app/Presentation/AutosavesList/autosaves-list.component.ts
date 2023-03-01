import { Component, OnInit } from '@angular/core';
import { AutosaveService } from '../../Service/Autosave/autosave.service';
import { Autosave } from '../../Domain/Autosave/autosave';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_DURATION, SNACKBAR_SUCCESS } from 'src/app/Domain/Common/constants';

@Component({
  selector: 'app-autosaves-list',
  templateUrl: './autosaves-list.component.html',
  styleUrls: ['./autosaves-list.component.scss'],
})
export class AutosavesListComponent implements OnInit {
  autosaves: Autosave[] = [];

  constructor(
    private autosaveService: AutosaveService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.autosaves = this.autosaveService.loadCurrentAutosaves();
  }

  loadAutosave(autosave: Autosave): void {
    this.autosaveService.loadAutosave(autosave);
    this.snackbar.open('Draft loaded', undefined, {
      duration: SNACKBAR_DURATION,
      panelClass: SNACKBAR_SUCCESS
    });
  }
}
