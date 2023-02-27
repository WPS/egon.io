import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TitleService } from '../../Service/Title/title.service';
import { ReplayService } from '../../Service/Replay/replay.service';
import { ReplayStateService } from '../../Service/Replay/replay-state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  title$ = this.titleService.title$;
  description$ = this.titleService.description$;
  showDescription$ = this.titleService.showDescription$;
  currentDomainName$ = this.titleService.domainName$;

  isReplay: Observable<boolean>;
  currentStepNumber: Observable<number>;
  maxStepNumber: Observable<number>;

  mouseOver = false;

  constructor(
    private titleService: TitleService,
    private replayService: ReplayService,
    private replayStateService: ReplayStateService
  ) {
    this.isReplay = this.replayStateService.getReplayOnObservable();
    this.currentStepNumber =
      this.replayService.getCurrentStepNumberObservable();
    this.maxStepNumber = this.replayService.getMaxStepNumberObservable();
  }
}
