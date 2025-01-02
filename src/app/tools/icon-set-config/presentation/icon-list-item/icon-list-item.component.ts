import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import { IconListItem } from '../../domain/iconListItem';
import { BehaviorSubject } from 'rxjs';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';

@Component({
  selector: 'app-icon-list-item',
  templateUrl: './icon-list-item.component.html',
  styleUrls: ['./icon-list-item.component.scss'],
  standalone: false,
})
export class IconListItemComponent implements OnInit, AfterViewChecked {
  @Input()
  iconName: string = '';

  private iconInitiated = false;

  // @ts-ignore
  icon = new BehaviorSubject<IconListItem>({});

  isActor: boolean = false;
  isWorkobject: boolean = false;
  isNone: boolean = true;

  get name(): string {
    return this.iconName;
  }

  get id() {
    return 'domain-configuration-icon-' + this.iconName;
  }

  constructor(
    private iconSetCustomizationService: IconSetCustomizationService,
  ) {}

  ngOnInit(): void {
    this.icon = this.iconSetCustomizationService.getIconForName(this.iconName);
    if (!this.icon) {
      return;
    }

    this.icon.subscribe((value) => {
      this.isActor = value.isActor;
      this.isWorkobject = value.isWorkObject;
      this.isNone = !(value.isActor || value.isWorkObject);
    });
    this.isActor = this.icon.value.isActor;
    this.isWorkobject = this.icon.value.isWorkObject;
    this.isNone = !(this.icon.value.isActor || this.icon.value.isWorkObject);
  }

  ngAfterViewChecked(): void {
    this.createIcon();
  }

  private createIcon(): void {
    const img = document.getElementById(this.id) as HTMLImageElement;
    if (img && !this.iconInitiated) {
      img.src = '' + this.icon?.value?.svg;
      this.iconInitiated = true;
    }
  }

  toggleNone() {
    this.iconSetCustomizationService.setAsUnassigned(
      this.iconName,
      this.icon.value.isActor,
    );
  }

  toggleActor(): void {
    this.iconSetCustomizationService.setAsActor(true, this.iconName);
  }

  toggleWorkobject(): void {
    this.iconSetCustomizationService.setAsWorkobject(true, this.iconName);
  }
}
