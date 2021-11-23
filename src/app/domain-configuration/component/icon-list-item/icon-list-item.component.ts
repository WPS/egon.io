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

@Component({
  selector: 'app-icon-list-item',
  templateUrl: './icon-list-item.component.html',
  styleUrls: ['./icon-list-item.component.scss'],
})
export class IconListItemComponent implements OnInit, AfterViewInit {
  @Input()
  public icon: IconListItem | undefined;

  @Output()
  checkActorEmitter = new EventEmitter<boolean>();
  @Output()
  checkWorkObjectEmitter = new EventEmitter<boolean>();

  public isActor: BehaviorSubject<boolean>;
  public isWorkobject: BehaviorSubject<boolean>;
  public isNone: BehaviorSubject<boolean>;

  constructor() {
    this.isActor = new BehaviorSubject(this.icon ? this.icon.isActor : false);
    this.isWorkobject = new BehaviorSubject(
      this.icon ? this.icon.isWorkObject : false
    );
    this.isNone = new BehaviorSubject(
      !(this.icon?.isActor || this.icon?.isWorkObject)
    );
  }

  ngOnInit(): void {
    this.isActor.next(this.icon ? this.icon.isActor : false);
    this.isWorkobject.next(this.icon ? this.icon.isWorkObject : false);
    this.isNone.next(!(this.icon?.isActor || this.icon?.isWorkObject));

    this.isActor.subscribe((value) => {
      if (this.icon) {
        this.icon.isActor = value;
      }
      this.checkActorEmitter.emit(value);
    });
    this.isWorkobject.subscribe((value) => {
      if (this.icon) {
        this.icon.isWorkObject = value;
      }
      this.checkWorkObjectEmitter.emit(value);
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
