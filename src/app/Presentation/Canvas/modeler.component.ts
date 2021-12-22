import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModelerService } from '../../Service/Modeler/modeler.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.scss'],
})
export class ModelerComponent implements OnInit, OnDestroy {

  modelerUpdatedSubscription: Subscription;

  constructor(private modelerService: ModelerService) {
    this.modelerUpdatedSubscription = this.modelerService.modelerUpdated().subscribe(() => {
      console.log('Modeler updated');
    });
  }

  ngOnInit(): void {
    this.modelerService.postInit();
  }

  ngOnDestroy() {
    this.modelerUpdatedSubscription.unsubscribe();
  }

}
