import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModelerService } from '../../Service/Modeler/modeler.service';
import { Subscription } from 'rxjs';
import { AutosaveService } from '../../Service/Autosave/autosave.service';
import { SaveStateService } from '../../Service/SaveState/save-state.service';

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.scss'],
})
export class ModelerComponent implements OnInit, OnDestroy {

  modelerUpdatedSubscription: Subscription;

  constructor(private modelerService: ModelerService, private saveStateService: SaveStateService) {
    this.modelerUpdatedSubscription = this.modelerService.getModelerUpdatedAsObservable().subscribe(() => {
      this.saveStateService.createSaveState();
    });
  }

  ngOnInit(): void {
    this.modelerService.postInit();
    this.saveStateService.loadSaveState();
  }

  ngOnDestroy() {
    this.modelerUpdatedSubscription.unsubscribe();
  }

}
