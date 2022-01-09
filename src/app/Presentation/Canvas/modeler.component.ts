import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModelerService } from '../../Service/Modeler/modeler.service';
import { Subscription } from 'rxjs';
import { AutosaveService } from '../../Service/Autosave/autosave.service';

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.scss'],
})
export class ModelerComponent implements OnInit, OnDestroy {

  modelerUpdatedSubscription: Subscription;

  constructor(private modelerService: ModelerService, private autosaveService: AutosaveService) {
    this.modelerUpdatedSubscription = this.modelerService.getModelerUpdatedAsObservable().subscribe(() => {
      console.log('Modeler updated');
      this.autosaveService.updateSaveState();
    });
  }

  ngOnInit(): void {
    this.modelerService.postInit();
    this.autosaveService.loadSaveState();
  }

  ngOnDestroy() {
    this.modelerUpdatedSubscription.unsubscribe();
  }

}
