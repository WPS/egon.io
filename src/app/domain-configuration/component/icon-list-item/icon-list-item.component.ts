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
  public icon: IconListItem = {};

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
    this.isActor.next(this.icon ? this.icon.isActor : false);
    this.isWorkobject.next(this.icon ? this.icon.isWorkObject : false);
    this.isNone.next(!(this.icon?.isActor || this.icon?.isWorkObject));

    this.isActor.subscribe((value) => {
      if (this.icon) {
        this.icon.isActor = value;
      }
      this.domainCustomizationService.checkActor(value, this.icon.name);
    });
    this.isWorkobject.subscribe((value) => {
      if (this.icon) {
        this.icon.isWorkObject = value;
      }
      this.domainCustomizationService.checkWorkobject(value, this.icon.name);
    });
  }

  ngAfterViewInit() {
    this.createIcon();
  }

  get name(): string {
    return this.icon ? this.icon.name : '';
  }

  get id() {
    return 'domain-configuration-icon-' + this.icon?.name;
  }

  toggleNone() {
    this.isWorkobject.next(false);
    this.isActor.next(false);
  }

  toggleActor(): void {
    this.isActor.next(true);
    this.isWorkobject.next(false);
  }

  toggleWorkobject(): void {
    this.isWorkobject.next(true);
    this.isActor.next(false);
  }

  private createIcon(): void {
    const img = document.getElementById(this.id) as HTMLImageElement;
    img.src = '' + this.icon?.svg;
  }
}
