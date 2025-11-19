import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IconSetCustomizationService } from 'src/app/tools/icon-set-config/services/icon-set-customization.service';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { IconListItem } from 'src/app/tools/icon-set-config/domain/iconListItem';

@Component({
  selector: 'app-icon-set-details',
  templateUrl: './icon-set-details.component.html',
  styleUrls: ['./icon-set-details.component.scss'],
  standalone: false,
})
export class IconSetDetailsComponent implements OnInit {
  iconSetName: Observable<string>;

  private draggedList: string = '';
  private draggedIndex = 0;

  selectedActors$ = this.customizationService.selectedActors$;
  selectedWorkobjects$ = this.customizationService.selectedWorkobjects$;

  constructor(
    private customizationService: IconSetCustomizationService,
    private importExportService: IconSetImportExportService,
  ) {
    this.iconSetName = importExportService.iconSetName$;
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

  exportIconSet(): void {
    this.importExportService.exportConfiguration();
  }
}
