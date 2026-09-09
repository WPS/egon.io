import { TestBed } from '@angular/core/testing';

import { SvgService } from 'src/app/tools/export/services/svg.service';
import { ModelerService } from '../../modeler/services/modeler.service';
import { MockProvider } from 'ng-mocks';
import { MINIMAL_SVG, TEST_SVG } from './spec/testSVG';
import { sanitizeTextForSVGExport } from 'src/app/utils/sanitizer';
import { testConfigAndDst } from 'src/app/tools/export/services/test-files/test_config_and_dst';

describe('SvgService', () => {
  let service: SvgService;

  let modelerServiceSpy: jest.Mocked<ModelerService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(ModelerService)],
    });

    modelerServiceSpy = TestBed.inject(
      ModelerService,
    ) as jest.Mocked<ModelerService>;
    modelerServiceSpy.getEncoded.mockReturnValue(TEST_SVG);

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
    expect(svgData).toContain('"domainStory":');
    expect(svgData).toContain('domainStory:activity');
    expect(svgData).toContain('domainStory:workObjectDocument');
    expect(svgData).toContain('"iconSet":');
    expect(svgData).toContain(
      "<text class='hiddenDomainStory' style='font-size: 0'>",
    );
    expect(svgData).toContain('</text>');
    expect(svgData).toContain(sanitizeTextForSVGExport('<DST>'));
    expect(svgData).toContain(sanitizeTextForSVGExport('</DST>'));
  });

  describe('With minimal DST', () => {
    beforeEach(() => {
      modelerServiceSpy = TestBed.inject(
        ModelerService,
      ) as jest.Mocked<ModelerService>;
      modelerServiceSpy.getEncoded.mockReturnValue(MINIMAL_SVG);

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
      expect(svgData).toContain('"domainStory":');
      expect(svgData).toContain('"iconSet":');
      expect(svgData).toContain(
        "<text class='hiddenDomainStory' style='font-size: 0'>",
      );
      expect(svgData).toContain('</text>');
      expect(svgData).toContain(sanitizeTextForSVGExport('<DST>'));
      expect(svgData).toContain(sanitizeTextForSVGExport('</DST>'));
    });
  });
});
