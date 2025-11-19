import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorkObjectLabelEntry } from '../../domain/workObjectLabelEntry';
import { LabelEntry } from '../../domain/labelEntry';
import { LabelDictionaryService } from '../../services/label-dictionary.service';

@Component({
  selector: 'app-label-dictionary',
  templateUrl: './label-dictionary.component.html',
  styleUrls: ['./label-dictionary.component.scss'],
  standalone: false,
})
export class LabelDictionaryComponent implements AfterViewInit {
  workobjectEntriesSubject: BehaviorSubject<WorkObjectLabelEntry[]>;
  activityEntriesSubject: BehaviorSubject<LabelEntry[]>;

  workObjectEntries: WorkObjectLabelEntry[];
  activityEntries: LabelEntry[];

  @Output()
  closeEmitter: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private labelDictionaryService: LabelDictionaryService,
    private cd: ChangeDetectorRef,
  ) {
    this.labelDictionaryService.createLabelDictionaries();
    this.workObjectEntries = this.labelDictionaryService.getWorkObjectLabels();
    this.activityEntries = this.labelDictionaryService.getActivityLabels();

    this.workobjectEntriesSubject = new BehaviorSubject(this.workObjectEntries);
    this.activityEntriesSubject = new BehaviorSubject(this.activityEntries);
  }

  ngAfterViewInit(): void {
    this.labelDictionaryService.createLabelDictionaries();
    this.workobjectEntriesSubject.next(
      this.labelDictionaryService.getWorkObjectLabels(),
    );
    this.activityEntriesSubject.next(
      this.labelDictionaryService.getActivityLabels(),
    );
    this.cd.detectChanges();
  }

  save(): void {
    this.workObjectEntries = this.workobjectEntriesSubject.value;
    this.activityEntries = this.activityEntriesSubject.value;

    const activityNames: string[] = [];
    const originalActivityNames: string[] = [];

    const workObjectNames: string[] = [];
    const originalWorkObjectNames: string[] = [];

    this.activityEntries
      .filter((a) => a.name !== a.originalName)
      .forEach((activity) => {
        activityNames.push(activity.name);
        originalActivityNames.push(activity.originalName);
      });

    this.workObjectEntries
      .filter((w) => w.name !== w.originalName)
      .forEach((workobject) => {
        workObjectNames.push(workobject.name);
        originalWorkObjectNames.push(workobject.originalName);
      });

    this.labelDictionaryService.massRenameLabels(
      activityNames,
      originalActivityNames,
      workObjectNames,
      originalWorkObjectNames,
    );
    this.closeEmitter.emit();
  }

  cancel(): void {
    this.workObjectEntries.forEach((w) => {
      w.name = w.originalName;
    });
    this.activityEntries.forEach((a) => {
      a.name = a.originalName;
    });

    this.workobjectEntriesSubject.next(this.workObjectEntries);
    this.activityEntriesSubject.next(this.activityEntries);
  }

  updateActivityEntry($event: Event, activityEntry: LabelEntry) {
    let entries = this.activityEntriesSubject.value;
    entries.filter(
      (e) => e.originalName === activityEntry.originalName,
      // @ts-ignore
    )[0].name = $event.target.value;
    this.activityEntriesSubject.next(entries);
  }

  updateWorkobjectEntry($event: Event, workobjectEntry: LabelEntry) {
    let entries = this.workobjectEntriesSubject.value;
    entries.filter(
      (e) => e.originalName === workobjectEntry.originalName,
      // @ts-ignore
    )[0].name = $event.target.value;
    this.workobjectEntriesSubject.next(entries);
  }

  preventDefault(event: Event): void {
    event.preventDefault();
  }

  close(): void {
    this.closeEmitter.emit();
  }
}
