import { TestBed } from '@angular/core/testing';

import { CommandStackService } from 'src/app/tools/modeler/services/command-stack.service';

describe('CommandStackService', () => {
  let service: CommandStackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommandStackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
