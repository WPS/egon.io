import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {TitleService} from '../../../Service/Title/title.service';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent implements OnInit {
  description: Observable<string>;

  constructor(private titleService: TitleService) {
    this.description = this.titleService.getDescriptionObservable();
  }

  ngOnInit(): void {
  }
}
