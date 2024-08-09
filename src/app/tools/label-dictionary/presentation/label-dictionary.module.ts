import { NgModule } from '@angular/core';
import { LabelDictionaryComponent } from './label-dictionary/label-dictionary.component';
import { LabelDictionaryDialogComponent } from './label-dictionary-dialog/label-dictionary-dialog.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';

@NgModule({
  declarations: [LabelDictionaryComponent, LabelDictionaryDialogComponent],
  exports: [LabelDictionaryComponent, LabelDictionaryDialogComponent],
  imports: [CommonModule, MaterialModule],
})
export class LabelDictionaryModule {}
