import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TitleService } from '../../Service/Title/title.service';
import { DialogService } from '../../Service/Dialog/dialog.service';
import { ReplayService } from '../../Service/Replay/replay.service';
import { ReplayStateService } from '../../Service/Replay/replay-state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  showDescription: Observable<boolean>;
  currentDomainName: Observable<string>;

  isReplay: Observable<boolean>;
  currentStepNumber: Observable<number>;
  maxStepNumber: Observable<number>;

  mouseOver = false;
  title: Observable<string>;
  description: Observable<string>;

  constructor(
    private titleService: TitleService,
    private dialogService: DialogService,
    private replayService: ReplayService,
    private replayStateService: ReplayStateService
  ) {
    this.title = this.titleService.getTitleObservable();
    this.description = this.titleService.getDescriptionObservable();
    this.isReplay = this.replayStateService.getReplayOnObservable();
    this.currentStepNumber =
      this.replayService.getCurrentStepNumberObservable();
    this.maxStepNumber = this.replayService.getMaxStepNumberObservable();

    this.showDescription = this.titleService.getShowDescriptionObservable();
    this.currentDomainName = this.titleService.getDomainNameAsObservable();
  }
}
