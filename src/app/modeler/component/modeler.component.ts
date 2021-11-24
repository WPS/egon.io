import { Component, OnInit } from '@angular/core';
import { ModelerService } from '../service/modeler.service';

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.scss'],
})
export class ModelerComponent implements OnInit {
  constructor(private modelerService: ModelerService) {}

  ngOnInit(): void {
    this.modelerService.postInit();
  }
}
