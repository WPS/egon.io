import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DomainCustomizationService } from 'src/app/Service/DomainConfiguration/domain-customization.service';
import { IconListItem } from 'src/app/Domain/Domain-Configuration/iconListItem';
import { TitleService } from 'src/app/Service/Title/title.service';

@Component({
  selector: 'app-domain-details',
  templateUrl: './domain-details.component.html',
  styleUrls: ['./domain-details.component.scss'],
})
export class DomainDetailsComponent implements OnInit {
  domainName: Observable<string>;

  private draggedList: string = '';
  private draggedIndex = 0;

  selectedActors$ = this.customizationService.selectedActors$;
  selectedWorkobjects$ = this.customizationService.selectedWorkobjects$;

  constructor(
    private customizationService: DomainCustomizationService,
    titleService: TitleService
  ) {
    this.domainName = titleService.domainName$;
  }

  ngOnInit(): void {}

  changeName(event: Event): void {
    // @ts-ignore
    this.customizationService.changeName(event.target.value);
  }

  getIconForName(iconName: string): IconListItem {
    return this.customizationService.getIconForName(iconName).value;
  }

  allowDrop($event: DragEvent, listName: string) {
    if (this.draggedList === listName) {
      $event.preventDefault();
    }
  }

  onDrop($event: DragEvent, iconName: string, actors: boolean, index: number) {
    let list;
    if (actors) {
      list = this.selectedActors$;
    } else {
      list = this.selectedWorkobjects$;
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

  onDragStart(index: number, draggedList: string) {
    this.draggedList = draggedList;
    this.draggedIndex = index;
  }
}
