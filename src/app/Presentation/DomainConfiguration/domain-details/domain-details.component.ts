import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DomainCustomizationService} from '../../../Service/Domain-Configuration/domain-customization.service';
import {IconListItem} from '../../../Domain/Domain-Configuration/iconListItem';

@Component({
  selector: 'app-domain-details',
  templateUrl: './domain-details.component.html',
  styleUrls: ['./domain-details.component.scss'],
})
export class DomainDetailsComponent implements OnInit {
  domainName: BehaviorSubject<string>;

  public selectedActors: BehaviorSubject<string[]>;
  public selectedWorkobjects: BehaviorSubject<string[]>;

  constructor(private customizationService: DomainCustomizationService) {
    this.domainName = customizationService.getDomainName();
    this.selectedActors = this.customizationService.getSelectedActors();
    this.selectedWorkobjects =
      this.customizationService.getSelectedWorkobjects();
  }

  ngOnInit(): void {
  }

  changeName(event: Event): void {
    // @ts-ignore
    this.customizationService.changeName(event.target.value);
  }

  getIconForName(iconName: string): IconListItem {
    return this.customizationService.getIconForName(iconName).value;
  }
}
