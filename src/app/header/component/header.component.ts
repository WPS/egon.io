import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModelerService } from '../../modeler/service/modeler.service';
import { TitleService } from '../../titleAndDescription/service/title.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  showDescription: Observable<boolean>;
  currentDomainName: Observable<string>;

  constructor(private titleService: TitleService) {
    this.showDescription = this.titleService.getShowDescriptionObservable();
    this.currentDomainName = this.titleService.getDomainNameAsObservable();
  }
}
