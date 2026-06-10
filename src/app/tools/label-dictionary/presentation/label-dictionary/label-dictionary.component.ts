import { Component, inject, output, signal } from '@angular/core';
import { LabelEntry } from '../../domain/labelEntry';
import { LabelDictionaryService } from '../../services/label-dictionary.service';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-label-dictionary',
  templateUrl: './label-dictionary.component.html',
  styleUrls: ['./label-dictionary.component.scss'],

  imports: [
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
  ],
})
export class LabelDictionaryComponent {
  private readonly labelDictionaryService = inject(LabelDictionaryService);

  readonly workObjectEntriesSignal = signal(
    this.labelDictionaryService.getWorkObjectLabels(),
  );
  readonly activityEntriesSignal = signal(
    this.labelDictionaryService.getActivityLabels(),
  );

  readonly closeEmitter = output();

  constructor() {
    this.labelDictionaryService.createLabelDictionaries();
  }

  save(): void {
    const workObjectEntries = this.workObjectEntriesSignal();
    const activityEntries = this.activityEntriesSignal();

    const activityNames: string[] = [];
    const originalActivityNames: string[] = [];

    const workObjectNames: string[] = [];
    const originalWorkObjectNames: string[] = [];

    activityEntries
      .filter((a) => a.name !== a.originalName)
      .forEach((activity) => {
        activityNames.push(activity.name);
        originalActivityNames.push(activity.originalName);
      });

    workObjectEntries
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
    const workObjectEntries = this.workObjectEntriesSignal();
    const activityEntries = this.activityEntriesSignal();

    workObjectEntries.forEach((w) => {
      w.name = w.originalName;
    });
    activityEntries.forEach((a) => {
      a.name = a.originalName;
    });

    this.workObjectEntriesSignal.set(workObjectEntries);
    this.activityEntriesSignal.set(activityEntries);
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
