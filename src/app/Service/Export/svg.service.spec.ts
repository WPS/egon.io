import { TestBed } from '@angular/core/testing';

import { SvgService } from 'src/app/Service/Export/svg.service';
import { ModelerService } from '../Modeler/modeler.service';
import { testConfigAndDst } from '../../Domain/Export/configAndDst';
import { TEST_SVG, TEST_URI_ENCODED_SVG } from './spec/testSVG';

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
      ModelerService
    ) as jasmine.SpyObj<ModelerService>;
    modelerServiceSpy.getEncoded.and.returnValue(TEST_SVG);

    service = TestBed.inject(SvgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create exportable SVG', () => {
    const svgData = service.createSVGData(
      'title',
      'description',
      testConfigAndDst,
      true
    );
    expect(svgData).toEqual(TEST_URI_ENCODED_SVG);
  });
});
