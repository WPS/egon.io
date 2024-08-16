import { Directive, HostBinding, HostListener } from '@angular/core';
import { ImportDomainStoryService } from '../services/import-domain-story.service';
import {
  SNACKBAR_DURATION_LONG,
  SNACKBAR_ERROR,
} from '../../../domain/entities/constants';
import { MatSnackBar } from '@angular/material/snack-bar';

@Directive({
  standalone: true,
  selector: '[appDrag]',
})
export class DragDirective {
  @HostBinding('style.background') private background = '';

  constructor(
    private importDomainStoryService: ImportDomainStoryService,
    private snackbar: MatSnackBar,
  ) {}

  @HostListener('dragover', ['$event']) public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#999';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '';
  }

  @HostListener('drop', ['$event']) public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '';

    if (evt.dataTransfer?.files[0]) {
      this.importDomainStoryService.performDropImport(
        evt.dataTransfer.files[0],
      );
    } else {
      this.snackbar.open('Nothing to import', undefined, {
        duration: SNACKBAR_DURATION_LONG,
        panelClass: SNACKBAR_ERROR,
      });
    }
  }
}
