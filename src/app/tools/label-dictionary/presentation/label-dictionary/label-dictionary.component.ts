import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Output,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
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
  readonly workObjectEntriesSignal: WritableSignal<WorkObjectLabelEntry[]>;
  readonly activityEntriesSignal: WritableSignal<LabelEntry[]>;

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

    this.workObjectEntriesSignal = signal(this.workObjectEntries);
    this.activityEntriesSignal = signal(this.activityEntries);
  }

  ngAfterViewInit(): void {
    this.labelDictionaryService.createLabelDictionaries();
    this.workObjectEntriesSignal.set(
      this.labelDictionaryService.getWorkObjectLabels(),
    );
    this.activityEntriesSignal.set(
      this.labelDictionaryService.getActivityLabels(),
    );
    this.cd.detectChanges();
  }

  save(): void {
    this.workObjectEntries = this.workObjectEntriesSignal();
    this.activityEntries = this.activityEntriesSignal();

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

    this.workObjectEntriesSignal.set(this.workObjectEntries);
    this.activityEntriesSignal.set(this.activityEntries);
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
    let entries = this.activityEntriesSignal();
    entries.filter(
      (e) => e.originalName === activityEntry.originalName,
    )[0].name = target.value;
    this.activityEntriesSignal.set(entries);
  }

  updateWorkObjectEntry($event: Event, workObjectEntry: LabelEntry) {
    const target = $event.target as HTMLInputElement;
    let entries = this.workObjectEntriesSignal();
    entries.filter(
      (e) => e.originalName === workObjectEntry.originalName,
    )[0].name = target.value;
    this.workObjectEntriesSignal.set(entries);
  }

  preventDefault(event: Event): void {
    event.preventDefault();
  }

  close(): void {
    this.closeEmitter.emit();
  }
}
