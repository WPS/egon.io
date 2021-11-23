import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { IconListItem } from '../../domain/iconListItem';
import { BehaviorSubject } from 'rxjs';
import { DomainCustomizationService } from '../../service/domain-customization.service';

@Component({
  selector: 'app-icon-list-item',
  templateUrl: './icon-list-item.component.html',
  styleUrls: ['./icon-list-item.component.scss'],
})
export class IconListItemComponent implements OnInit, AfterViewInit {
  @Input()
  public iconName: string = '';

  // @ts-ignore
  public icon = new BehaviorSubject<IconListItem>({});

  public isActor: BehaviorSubject<boolean>;
  public isWorkobject: BehaviorSubject<boolean>;
  public isNone: BehaviorSubject<boolean>;

  constructor(private domainCustomizationService: DomainCustomizationService) {
    this.isActor = new BehaviorSubject<boolean>(false);
    this.isWorkobject = new BehaviorSubject<boolean>(false);
    this.isNone = new BehaviorSubject<boolean>(true);
  }

  ngOnInit(): void {
    this.icon = this.domainCustomizationService.getIconForName(this.iconName);
    this.icon.subscribe((value) => {
      this.isActor.next(value.isActor);
      this.isWorkobject.next(value.isWorkObject);
      this.isNone.next(!(value.isActor || value.isWorkObject));
    });
    this.isActor.next(this.icon.value.isActor);
    this.isWorkobject.next(this.icon.value.isWorkObject);
    this.isNone.next(
      !(this.icon.value.isActor || this.icon.value.isWorkObject)
    );
  }

  ngAfterViewInit() {
    this.createIcon();
  }

  get name(): string {
    return this.iconName;
  }

  get id() {
    return 'domain-configuration-icon-' + this.iconName;
  }

  toggleNone() {
    this.domainCustomizationService.checkNone(this.iconName);
  }

  toggleActor(): void {
    this.domainCustomizationService.checkActor(true, this.iconName);
  }

  toggleWorkobject(): void {
    this.domainCustomizationService.checkWorkobject(true, this.iconName);
  }

  private createIcon(): void {
    const img = document.getElementById(this.id) as HTMLImageElement;
    img.src = '' + this.icon.value?.svg;
  }
}
