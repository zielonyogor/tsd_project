import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { FAKE_SPRINT_BOARDS, FAKE_SPRINTS, type SprintBoardData } from '../../data/fake-sprint-boards';

import { Home } from './home';
import { SprintService } from '../../services/sprint.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let baselineBoards: Record<string, SprintBoardData>;

  const mockSprintService = {
    getSprints: vi.fn(),
    createSprint: vi.fn(),
  };

  interface HomeTestAccess {
    sprints: {
      id: string;
      goal: string;
      startDate: Date;
      endDate: Date;
    }[];
    createError: string;
    isCreatingSprint: boolean;
    newSprintForm: {
      title: string;
      startDate: string;
      endDate: string;
    };
  };

  const cloneBoards = (source: Record<string, SprintBoardData>): Record<string, SprintBoardData> => {
    return Object.fromEntries(
      Object.entries(source).map(([boardId, board]) => [
        boardId,
        {
          sprint: {
            ...board.sprint,
            startDate: new Date(board.sprint.startDate),
            endDate: new Date(board.sprint.endDate),
          },
          userStories: board.userStories.map(story => ({ ...story })),
        },
      ]),
    );
  };

  const restoreBoards = (source: Record<string, SprintBoardData>): void => {
    for (const boardId of Object.keys(FAKE_SPRINT_BOARDS)) {
      delete FAKE_SPRINT_BOARDS[boardId];
    }

    Object.assign(FAKE_SPRINT_BOARDS, cloneBoards(source));
  };

  beforeAll(() => {
    baselineBoards = cloneBoards(FAKE_SPRINT_BOARDS);
  });

  beforeEach(async () => {
    restoreBoards(baselineBoards);
    
    vi.clearAllMocks();
    mockSprintService.getSprints.mockResolvedValue(FAKE_SPRINTS);
    mockSprintService.createSprint.mockImplementation((sprint) => Promise.resolve(sprint));

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve(true),
          },
        },
        {
          provide: SprintService,
          useValue: mockSprintService
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterAll(() => {
    restoreBoards(baselineBoards);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render sprint cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sprintCards = compiled.querySelectorAll('.sprint-card');
    expect(sprintCards.length).toBeGreaterThan(0);
  });

  it('does not create sprint when start date is after end date', () => {
    const home = component as unknown as HomeTestAccess;
    const initialCount = home.sprints.length;

    component.addSprint();
    home.newSprintForm.title = 'Invalid date sprint';
    home.newSprintForm.startDate = '2026-03-20';
    home.newSprintForm.endDate = '2026-03-10';

    component.createSprint();

    expect(home.createError).toBe('End date must be on or after start date.');
    expect(home.sprints.length).toBe(initialCount);
  });

  it('does not create sprint when title is empty', () => {
    const home = component as unknown as HomeTestAccess;
    const initialCount = home.sprints.length;

    component.addSprint();
    home.newSprintForm.title = '   ';
    home.newSprintForm.startDate = '2026-03-10';
    home.newSprintForm.endDate = '2026-03-20';

    component.createSprint();

    expect(home.createError).toBe('Please provide sprint title, start date and end date.');
    expect(home.sprints.length).toBe(initialCount);
  });

  it('creates sprint when title and dates are valid', async () => {
    const home = component as unknown as HomeTestAccess;
    const initialCount = home.sprints.length;

    component.addSprint();
    home.newSprintForm.title = 'Ship release dashboard';
    home.newSprintForm.startDate = '2026-04-01';
    home.newSprintForm.endDate = '2026-04-14';

    component.createSprint();
    await fixture.whenStable();
    fixture.detectChanges();

    const createdSprint = home.sprints[home.sprints.length - 1];

    expect(home.createError).toBe('');
    expect(home.isCreatingSprint).toBe(false);
    expect(home.sprints.length).toBe(initialCount + 1);
    expect(createdSprint.goal).toBe('Ship release dashboard');
    expect(createdSprint.startDate).toEqual(new Date(2026, 3, 1));
    expect(createdSprint.endDate).toEqual(new Date(2026, 3, 14));
    expect(home.sprints[initialCount]).toBeDefined();
  });
});
