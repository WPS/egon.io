import {
  Component,
  computed,
  inject,
  input,
  output,
  Signal,
} from '@angular/core';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrls: ['./header-buttons.component.scss'],

  imports: [CommonModule, MatButtonModule],
})
export class HeaderButtonsComponent {
  private readonly replayService = inject(ReplayService);

  readonly sentenceDescription: Signal<string> = computed(
    () =>
      `${this.replayService.currentSentence()}/${this.replayService.maxSentenceNumber()}`,
  );

  readonly hasDomainStory = input(false);
  readonly hasTitle = input(false);
  readonly isReplaying = input<boolean | null>(false);
  readonly showGroups = input<boolean | null>(false);
  readonly hasGroups = input<boolean | null>(false);
  readonly isDirty = input<boolean | null>(false);
  readonly isReplayable = input(false);

  readonly import = output();
  readonly openSettings = output();
  readonly startReplay = output();
  readonly stopReplay = output();
  readonly previousSentence = output();
  readonly nextSentence = output();
  readonly newStory = output();
  readonly toggleGroups = output();
  readonly showKeyboardShortCuts = output();
  readonly openLabelDictionary = output();
  readonly openDownloadDialog = output();
  readonly openImportFromUrlDialog = output();
}
