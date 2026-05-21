import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalLinkGeneratorDialogComponent } from 'src/app/tools/export/presentation/external-link-generator-dialog/external-link-generator-dialog.component';

describe('ExternalLinkGeneratorDialogueComponent', () => {
  let component: ExternalLinkGeneratorDialogComponent;
  let fixture: ComponentFixture<ExternalLinkGeneratorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalLinkGeneratorDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalLinkGeneratorDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
