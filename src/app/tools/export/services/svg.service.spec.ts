import { TestBed } from '@angular/core/testing';

import { SvgService } from 'src/app/tools/export/services/svg.service';
import { ModelerService } from '../../modeler/services/modeler.service';
import { testConfigAndDst } from '../domain/export/configAndDst';
import { MINIMAL_SVG, TEST_SVG } from './spec/testSVG';

describe('SvgService', () => {
  let service: SvgService;

  let modelerServiceSpy: jasmine.SpyObj<ModelerService>;

  beforeEach(() => {
    const modelerServiceMock = jasmine.createSpyObj('ModelerService', [
      'getEncoded',
    ]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModelerService,
          useValue: modelerServiceMock,
        },
      ],
    });

    modelerServiceSpy = TestBed.inject(
      ModelerService,
    ) as jasmine.SpyObj<ModelerService>;
    modelerServiceSpy.getEncoded.and.returnValue(TEST_SVG);

    service = TestBed.inject(SvgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create exportable SVG with simple dst', () => {
    const svgData = service.createSVGData(
      'title',
      'description',
      testConfigAndDst,
      true,
      false,
    );
    expect(svgData).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(svgData).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svgData).toContain('"dst":');
    expect(svgData).toContain('domainStory:activity');
    expect(svgData).toContain('domainStory:workObjectDocument');
    expect(svgData).toContain('"domain":');
    expect(svgData).toContain('<!-- <DST>');
    expect(svgData).toContain('</DST> -->');
  });

  describe('With minimal DST', () => {
    beforeEach(() => {
      modelerServiceSpy = TestBed.inject(
        ModelerService,
      ) as jasmine.SpyObj<ModelerService>;
      modelerServiceSpy.getEncoded.and.returnValue(MINIMAL_SVG);

      service = TestBed.inject(SvgService);
    });

    it('should create exportable SVG with minimal dst', () => {
      const svgData = service.createSVGData(
        'title',
        'description',
        testConfigAndDst,
        true,
        false,
      );
      expect(svgData).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(svgData).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svgData).toContain('"dst":');
      expect(svgData).toContain('"domain":');
      expect(svgData).toContain('<!-- <DST>');
      expect(svgData).toContain('</DST> -->');
    });
  });
});
