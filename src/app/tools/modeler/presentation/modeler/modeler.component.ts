import { Component, OnInit } from '@angular/core';
import { ModelerService } from '../../services/modeler.service';
import { AutosaveService } from '../../../autosave/services/autosave.service';

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.scss'],
})
export class ModelerComponent implements OnInit {
  constructor(
    private modelerService: ModelerService,
    private autosaveService: AutosaveService,
  ) {}

  ngOnInit(): void {
    this.modelerService.postInit();
    this.autosaveService.loadLatestDraft();
  }
}
