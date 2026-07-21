import { TestBed } from '@angular/core/testing';
import { MockProviders } from 'ng-mocks';
import { StoryAsSpecService } from './story-as-spec.service';
import { DomainStoryStepBuilderService } from './domain-story-step-builder.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { INITIAL_TITLE } from '../../../domain/entities/constants';

describe('StoryAsSpecService', () => {
  let service: StoryAsSpecService;
  let stepBuilder: DomainStoryStepBuilderService;
  let propertiesServiceMock: {
    title: jasmine.Spy;
    description: jasmine.Spy;
  };

  beforeEach(() => {
    propertiesServiceMock = {
      title: jasmine.createSpy('title').and.returnValue(INITIAL_TITLE),
      description: jasmine.createSpy('description').and.returnValue(''),
    };
    TestBed.configureTestingModule({
      providers: [
        MockProviders(DomainStoryStepBuilderService),
        { provide: PropertiesService, useValue: propertiesServiceMock },
      ],
    });
    service = TestBed.inject(StoryAsSpecService);
    stepBuilder = TestBed.inject(DomainStoryStepBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('renders a Story header, Goal in Context, and numbered Scenario with a plain 3-part step', () => {
    propertiesServiceMock.title.and.returnValue('Event Review');
    propertiesServiceMock.description.and.returnValue(
      'Event Owner wants to submit an event and get it reviewed',
    );
    spyOn(stepBuilder, 'build').and.returnValue({
      steps: [
        {
          stepNumber: 1,
          stepParts: ['Event Owner', 'registers', 'informations'],
          annotations: [
            {
              elementName: 'informations',
              lines: [
                'Auth can be made by Google',
                'Normal email address can be registered',
              ],
            },
          ],
        },
      ],
      actors: new Set(['Event Owner']),
      workObjects: new Set(['informations']),
    });

    const spec = service.generateStoryAsSpec();

    expect(spec).toContain('Story: Event Review');
    expect(spec).toContain(
      'Goal in Context: Event Owner wants to submit an event and get it reviewed',
    );
    expect(spec).not.toContain('Trigger:');
    expect(spec).toContain('Scenario:');
    expect(spec).toContain(
      '1. Event Owner registers informations\n   (Auth can be made by Google; Normal email address can be registered)',
    );
    expect(spec).toContain('Actors: Event Owner');
    expect(spec).toContain('Entities: informations');
  });

  it('appends "with {next}" for a 4-part step (one clean chain continuation)', () => {
    propertiesServiceMock.title.and.returnValue('Event Review');
    propertiesServiceMock.description.and.returnValue('Reviewing events');
    spyOn(stepBuilder, 'build').and.returnValue({
      steps: [
        {
          stepNumber: 1,
          stepParts: ['Event Owner', 'registers', 'informations', 'System'],
          annotations: [],
        },
      ],
      actors: new Set(['Event Owner', 'System']),
      workObjects: new Set(['informations']),
    });

    const spec = service.generateStoryAsSpec();

    expect(spec).toContain('1. Event Owner registers informations with System');
  });

  it('falls back to the arrow-chain format for a step with 5+ parts (embedded connector label)', () => {
    propertiesServiceMock.title.and.returnValue('Event Review');
    propertiesServiceMock.description.and.returnValue('Reviewing events');
    spyOn(stepBuilder, 'build').and.returnValue({
      steps: [
        {
          stepNumber: 4,
          stepParts: [
            'Event Root',
            'rejects',
            'Rejected event',
            'triggers',
            'System',
          ],
          annotations: [
            {
              elementName: 'Rejected event',
              lines: ['Missing mandatory fields', 'Invalid event dates'],
            },
          ],
        },
      ],
      actors: new Set(['Event Root', 'System']),
      workObjects: new Set(['Rejected event']),
    });

    const spec = service.generateStoryAsSpec();

    expect(spec).toContain(
      '4. Event Root → rejects → Rejected event → triggers → System\n   (Missing mandatory fields; Invalid event dates)',
    );
  });

  it('falls back to TODO placeholders for header, scenario, actors, and entities when there is no story data, and omits Goal in Context and Trigger entirely', () => {
    spyOn(stepBuilder, 'build').and.returnValue({
      steps: [],
      actors: new Set(),
      workObjects: new Set(),
    });

    const spec = service.generateStoryAsSpec();

    expect(spec).toContain('Story: Story Name');
    expect(spec).not.toContain('Goal in Context');
    expect(spec).not.toContain('Trigger:');
    expect(spec).toContain('1. TODO: Describe the flow.');
    expect(spec).toContain('Actors: TODO: List actors.');
    expect(spec).toContain('Entities: TODO: List entities.');
  });

  it('falls back to a 1-based index when a step has no stepNumber', () => {
    spyOn(stepBuilder, 'build').and.returnValue({
      steps: [
        { stepNumber: '', stepParts: ['A', 'does', 'X'], annotations: [] },
        { stepNumber: '', stepParts: ['B', 'does', 'Y'], annotations: [] },
      ],
      actors: new Set(['A', 'B']),
      workObjects: new Set(['X', 'Y']),
    });

    const spec = service.generateStoryAsSpec();

    expect(spec).toContain('1. A does X');
    expect(spec).toContain('2. B does Y');
  });
});
