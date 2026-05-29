import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorkObjectLabelEntry } from '../../domain/workObjectLabelEntry';
import { LabelEntry } from '../../domain/labelEntry';
import { LabelDictionaryService } from '../../services/label-dictionary.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-label-dictionary',
  templateUrl: './label-dictionary.component.html',
  styleUrls: ['./label-dictionary.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
  ],
})
export class LabelDictionaryComponent implements AfterViewInit {
  readonly workObjectEntriesSubject: BehaviorSubject<WorkObjectLabelEntry[]>;
  readonly activityEntriesSubject: BehaviorSubject<LabelEntry[]>;

  workObjectEntries: WorkObjectLabelEntry[];
  activityEntries: LabelEntry[];

  @Output()
  readonly closeEmitter: EventEmitter<void> = new EventEmitter<void>();

  private readonly labelDictionaryService = inject(LabelDictionaryService);
  private readonly cd = inject(ChangeDetectorRef);

  constructor() {
    this.labelDictionaryService.createLabelDictionaries();
    this.workObjectEntries = this.labelDictionaryService.getWorkObjectLabels();
    this.activityEntries = this.labelDictionaryService.getActivityLabels();

    this.workObjectEntriesSubject = new BehaviorSubject(this.workObjectEntries);
    this.activityEntriesSubject = new BehaviorSubject(this.activityEntries);
  }

  ngAfterViewInit(): void {
    this.labelDictionaryService.createLabelDictionaries();
    this.workObjectEntriesSubject.next(
      this.labelDictionaryService.getWorkObjectLabels(),
    );
    this.activityEntriesSubject.next(
      this.labelDictionaryService.getActivityLabels(),
    );
    this.cd.detectChanges();
  }

  save(): void {
    this.workObjectEntries = this.workObjectEntriesSubject.value;
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
      .forEach((workObject) => {
        workObjectNames.push(workObject.name);
        originalWorkObjectNames.push(workObject.originalName);
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

    this.workObjectEntriesSubject.next(this.workObjectEntries);
    this.activityEntriesSubject.next(this.activityEntries);
  }

  // The keydown in the input / textarea field is handled before the (change) event, thus we need to trigger the update manually
  saveDirectFromActivity($event: Event, activityEntry: LabelEntry): void {
    this.updateActivityEntry($event, activityEntry);
    this.save();
  }

  // The keydown in the input / textarea field is handled before the (change) event, thus we need to trigger the update manually
  saveDirectFromWorkObject($event: Event, workObjectEntry: LabelEntry): void {
    this.updateWorkObjectEntry($event, workObjectEntry);
    this.save();
  }

  updateActivityEntry($event: Event, activityEntry: LabelEntry) {
    const target = $event.target as HTMLInputElement;
    let entries = this.activityEntriesSubject.value;
    entries.filter(
      (e) => e.originalName === activityEntry.originalName,
    )[0].name = target.value;
    this.activityEntriesSubject.next(entries);
  }

  updateWorkObjectEntry($event: Event, workObjectEntry: LabelEntry) {
    const target = $event.target as HTMLInputElement;
    let entries = this.workObjectEntriesSubject.value;
    entries.filter(
      (e) => e.originalName === workObjectEntry.originalName,
    )[0].name = target.value;
    this.workObjectEntriesSubject.next(entries);
  }

  preventDefault(event: Event): void {
    event.preventDefault();
  }

  close(): void {
    this.closeEmitter.emit();
  }
}
