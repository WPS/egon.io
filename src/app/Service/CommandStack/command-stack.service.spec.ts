import { TestBed } from '@angular/core/testing';

import { CommandStackService } from './command-stack.service';

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
