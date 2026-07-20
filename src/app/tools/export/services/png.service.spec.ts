import { TestBed } from '@angular/core/testing';

import { PngService } from 'src/app/tools/export/services/png.service';

describe('PngService', () => {
  let service: PngService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PngService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createTempCanvas', () => {
    it('adds 10px of padding to the requested dimensions', () => {
      const canvas = service.createTempCanvas(200, 120);

      expect(canvas.tagName.toLowerCase()).toBe('canvas');
      expect(canvas.width).toBe(210);
      expect(canvas.height).toBe(130);
    });
  });
});
