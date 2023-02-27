import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DomainCustomizationService } from '../../../Service/DomainConfiguration/domain-customization.service';
import { IconListItem } from '../../../Domain/Domain-Configuration/iconListItem';
import { TitleService } from 'src/app/Service/Title/title.service';

@Component({
  selector: 'app-domain-details',
  templateUrl: './domain-details.component.html',
  styleUrls: ['./domain-details.component.scss'],
})
export class DomainDetailsComponent implements OnInit {
  domainName: Observable<string>;

  private draggedIndex = 0;

  public selectedActors: BehaviorSubject<string[]>;
  public selectedWorkobjects: BehaviorSubject<string[]>;

  constructor(
    private customizationService: DomainCustomizationService,
    titleService: TitleService) {
    this.domainName = titleService.domainName$;
    this.selectedActors = this.customizationService.getSelectedActors();
    this.selectedWorkobjects =
      this.customizationService.getSelectedWorkobjects();
  }

  ngOnInit(): void {}

  public changeName(event: Event): void {
    // @ts-ignore
    this.customizationService.changeName(event.target.value);
  }

  public getIconForName(iconName: string): IconListItem {
    return this.customizationService.getIconForName(iconName).value;
  }

  public allowDrop($event: DragEvent) {
    $event.preventDefault();
  }

  public onDrop(
    $event: DragEvent,
    iconName: string,
    actors: boolean,
    index: number
  ) {
    let list;
    if (actors) {
      list = this.selectedActors;
    } else {
      list = this.selectedWorkobjects;
    }
    const sortedList = list.value;
    const item = sortedList[this.draggedIndex];
    sortedList.splice(this.draggedIndex, 1);
    sortedList.splice(index, 0, item);
    list.next(sortedList);

    if (actors) {
      this.customizationService.setSelectedActors(sortedList);
    } else {
      this.customizationService.setSelectedWorkObject(sortedList);
    }
  }

  public onDragStart(index: number) {
    this.draggedIndex = index;
  }
}
