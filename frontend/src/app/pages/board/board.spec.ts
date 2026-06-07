import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { convertToParamMap } from '@angular/router';
// @ts-expect-error: missing rxjs types
import { Subject } from 'rxjs';

import { FAKE_SPRINT_BOARDS, FAKE_SPRINTS } from '../../data/fake-sprint-boards';
import { clearCurrentUser, saveCurrentUser } from '../../data/user-storage';

import { SprintService } from '../../services/sprint.service';
import { RealtimeSprintService } from '../../services/realtime-sprint.service';
import { Board } from './board';



describe('Board', () => {
  let component: Board;
  let fixture: ComponentFixture<Board>;
  let navigateCalls: unknown[][];
  let paramMapSubscribers: ((paramMap: ReturnType<typeof convertToParamMap>) => void)[];
  let currentParamMap: ReturnType<typeof convertToParamMap>;

  const mockSprintService = {
    getSprints: vi.fn(),
    getSprintForUser: vi.fn(),
    getStories: vi.fn(),
    createUserStory: vi.fn(),
    updateUserStory: vi.fn(),
    finishSprint: vi.fn()
  };

  const mockRealtimeSprintService = {
    onUserStoryCreated: new Subject(),
    onUserStoryUpdated: new Subject(),
    onSprintUpdated: new Subject(),
    joinSprint: vi.fn().mockResolvedValue(undefined),
    leaveSprint: vi.fn().mockResolvedValue(undefined),
  };

  const activatedRoute = {
    paramMap: {
      subscribe: (callback: (paramMap: ReturnType<typeof convertToParamMap>) => void) => {
        paramMapSubscribers.push(callback);
        callback(currentParamMap);

        return {
          unsubscribe: () => {
            paramMapSubscribers = paramMapSubscribers.filter((subscriber) => subscriber !== callback);
          },
        };
      },
    },
  };

  const emitParamMap = (params: Record<string, string>): void => {
    currentParamMap = convertToParamMap(params);

    for (const subscriber of paramMapSubscribers) {
      subscriber(currentParamMap);
    }
  };

  beforeEach(async () => {
    navigateCalls = [];
    paramMapSubscribers = [];
    currentParamMap = convertToParamMap({ id: '1' });
    clearCurrentUser();
    saveCurrentUser({ id: 1, name: 'Alice' });

    vi.clearAllMocks();
    mockSprintService.getSprints.mockResolvedValue(FAKE_SPRINTS);
    mockSprintService.getSprintForUser.mockResolvedValue({
      ...FAKE_SPRINT_BOARDS['1'].sprint,
      status: 'InProgress'
    });
    mockSprintService.getStories.mockResolvedValue(FAKE_SPRINT_BOARDS['1'].userStories);
    mockSprintService.createUserStory.mockImplementation((story) => 
      Promise.resolve({ ...story, id: Math.floor(Math.random() * 1000).toString() })
    );

    await TestBed.configureTestingModule({
      imports: [Board],
      providers: [
        { provide: SprintService, useValue: mockSprintService },
        { provide: RealtimeSprintService, useValue: mockRealtimeSprintService },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: Router,
          useValue: {
            navigate: (commands: string[]): Promise<boolean> => {
              navigateCalls.push(commands);
              return Promise.resolve(true);
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Board);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    clearCurrentUser();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads sprint data from the route param id', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.sprint).toEqual({
      ...FAKE_SPRINT_BOARDS['1'].sprint,
      status: 'InProgress'
    });
    expect(component.getUserStoriesForColumn('To Do')).toEqual([
      FAKE_SPRINT_BOARDS['1'].userStories[0],
    ]);
    expect(navigateCalls).toEqual([]);
  });

  it('redirects to home when no board id is provided', async () => {
    mockSprintService.getSprints.mockResolvedValue(FAKE_SPRINTS);
    emitParamMap({});
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateCalls).toContainEqual(['/']);
  });

  it('redirects to home when the board id does not exist', async () => {
    mockSprintService.getSprintForUser.mockRejectedValueOnce(new Error('missing board'));
    emitParamMap({ id: '999' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(navigateCalls).toContainEqual(['/']);
  });

  it('renders the selected sprint goal and user stories', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const title = element.querySelector('.sprint-goal');
    const storyCards = element.querySelectorAll('app-user-story-card');

    expect(title?.textContent).toContain('Make MVP');
    expect(storyCards.length).toBe(FAKE_SPRINT_BOARDS['1'].userStories.length);
  });

  it('creates a new user story with all UserStory fields', async () => {
    const board = component as unknown as {
      onAddStory: () => void;
      createStory: () => void;
      newStoryForm: {
        title: string;
        description: string;
        status: 'To Do' | 'Blocked' | 'In Progress' | 'Code Review' | 'Done';
      };
    };
    const initialCount = component.getUserStoriesForColumn('Done').length;

    board.onAddStory();
    board.newStoryForm.title = 'New flow for checkout';
    board.newStoryForm.description = 'As a user, I want a faster checkout flow.';
    board.newStoryForm.status = 'Done';
    board.createStory();
    
    await fixture.whenStable();
    fixture.detectChanges();

    const doneStories = component.getUserStoriesForColumn('Done');
    const createdStory = doneStories[doneStories.length - 1];

    expect(doneStories.length).toBe(initialCount + 1);
    expect(createdStory.title).toBe('New flow for checkout');
    expect(createdStory.description).toBe('As a user, I want a faster checkout flow.');
    expect(createdStory.status).toBe('Done');
    expect(createdStory.sprintId).toBe(component.sprint!.id);
    expect(createdStory.id).toMatch(/^[0-9]+$/);
  });

  it('opens an existing user story for editing and saves changes', async () => {
    const board = component as unknown as {
      onOpenStory: (story: (typeof FAKE_SPRINT_BOARDS)['1']['userStories'][number]) => void;
      saveStory: () => void;
      editStoryForm: {
        title: string;
        description: string;
        status: 'To Do' | 'Blocked' | 'In Progress' | 'Code Review' | 'Done';
      };
      isEditingStory: boolean;
      editStoryError: string;
    };
    const story = component.getUserStoriesForColumn('To Do')[0];

    board.onOpenStory(story);
    board.editStoryForm.title = 'Updated story title';
    board.editStoryForm.description = 'Updated story description';
    board.editStoryForm.status = 'Blocked';
    board.saveStory();
    
    await fixture.whenStable();
    fixture.detectChanges();

    expect(board.isEditingStory).toBe(false);
    expect(board.editStoryError).toBe('');
    expect(component.getUserStoriesForColumn('Blocked')).toContain(story);
    expect(story.title).toBe('Updated story title');
    expect(story.description).toBe('Updated story description');
    expect(story.status).toBe('Blocked');
  });

  it('shows validation error when creating a user story without required fields', () => {
    const board = component as unknown as {
      onAddStory: () => void;
      createStory: () => void;
      newStoryForm: {
        title: string;
        description: string;
      };
      createStoryError: string;
      isCreatingStory: boolean;
    };

    board.onAddStory();
    board.newStoryForm.title = '   ';
    board.newStoryForm.description = '';
    board.createStory();

    expect(board.createStoryError).toBe('Please provide user story title and description.');
    expect(board.isCreatingStory).toBe(true);
  });

  it('shows validation error when saving an edited user story without required fields', () => {
    const board = component as unknown as {
      onOpenStory: (story: (typeof FAKE_SPRINT_BOARDS)['1']['userStories'][number]) => void;
      saveStory: () => void;
      editStoryForm: {
        title: string;
        description: string;
      };
      editStoryError: string;
      isEditingStory: boolean;
    };
    const story = FAKE_SPRINT_BOARDS['1'].userStories[0];

    board.onOpenStory(story);
    board.editStoryForm.title = '   ';
    board.editStoryForm.description = '';
    board.saveStory();

    expect(board.editStoryError).toBe('Please provide user story title and description.');
    expect(board.isEditingStory).toBe(true);
  });

  it('shows validation error when creating a user story with empty title and valid description', () => {
    const board = component as unknown as {
      onAddStory: () => void;
      createStory: () => void;
      newStoryForm: {
        title: string;
        description: string;
      };
      createStoryError: string;
      isCreatingStory: boolean;
    };

    board.onAddStory();
    board.newStoryForm.title = '';
    board.newStoryForm.description = 'Valid description';
    board.createStory();

    expect(board.createStoryError).toBe('Please provide user story title and description.');
    expect(board.isCreatingStory).toBe(true);
  });

  it('shows validation error when creating a user story with valid title and empty description', () => {
    const board = component as unknown as {
      onAddStory: () => void;
      createStory: () => void;
      newStoryForm: {
        title: string;
        description: string;
      };
      createStoryError: string;
      isCreatingStory: boolean;
    };

    board.onAddStory();
    board.newStoryForm.title = 'Valid title';
    board.newStoryForm.description = '';
    board.createStory();

    expect(board.createStoryError).toBe('Please provide user story title and description.');
    expect(board.isCreatingStory).toBe(true);
  });

  it('cancels user story creation and closes the modal', () => {
    const board = component as unknown as {
      onAddStory: () => void;
      cancelStoryCreation: () => void;
      newStoryForm: {
        title: string;
        description: string;
      };
      createStoryError: string;
      isCreatingStory: boolean;
    };

    board.onAddStory();
    board.newStoryForm.title = 'Test story';
    board.newStoryForm.description = 'Test description';
    board.createStoryError = 'Some error';

    board.cancelStoryCreation();

    expect(board.isCreatingStory).toBe(false);
    expect(board.createStoryError).toBe('');
  });

  it('resets form fields when opening create user story modal', () => {
    const board = component as unknown as {
      onAddStory: () => void;
      newStoryForm: {
        title: string;
        description: string;
        status: 'To Do' | 'Blocked' | 'In Progress' | 'Code Review' | 'Done';
      };
    };


    board.newStoryForm.title = 'Previous title';
    board.newStoryForm.description = 'Previous description';
    board.newStoryForm.status = 'Done';

    board.onAddStory();

    expect(board.newStoryForm.title).toBe('');
    expect(board.newStoryForm.description).toBe('');
    expect(board.newStoryForm.status).toBe('To Do');
  });

  it('resets form between creating multiple stories in succession', async () => {
    const board = component as unknown as {
      onAddStory: () => void;
      createStory: () => void;
      newStoryForm: {
        title: string;
        description: string;
        status: 'To Do' | 'Blocked' | 'In Progress' | 'Code Review' | 'Done';
      };
    };

    // Create first story
    board.onAddStory();
    board.newStoryForm.title = 'First story';
    board.newStoryForm.description = 'First description';
    board.createStory();
    await fixture.whenStable();

    // Create second story
    board.onAddStory();
    expect(board.newStoryForm.title).toBe(''); // Form should be reset now

    board.newStoryForm.title = 'Second story';
    board.newStoryForm.description = 'Second description';
    board.newStoryForm.status = 'In Progress';
    board.createStory();
    
    await fixture.whenStable();
    fixture.detectChanges();

    const inProgressStories = component.getUserStoriesForColumn('In Progress');
    const lastStory = inProgressStories[inProgressStories.length - 1];

    expect(lastStory.title).toBe('Second story');
  });

  it('displays the correct sprint status label', () => {
    const board = component as unknown as { sprintStatusLabel: (status: string) => string };
    expect(board.sprintStatusLabel('InProgress')).toBe('In progress');
    expect(board.sprintStatusLabel('Upcoming')).toBe('Upcoming');
    expect(board.sprintStatusLabel('Done')).toBe('Done');
  });

  it('prevents adding a user story if the sprint is "Done"', () => {
    component.sprint = { ...FAKE_SPRINT_BOARDS['1'].sprint, status: 'Done' };
    const board = component as unknown as {
      onAddStory: () => void;
      isCreatingStory: boolean;
    };
    
    board.isCreatingStory = false;
    board.onAddStory();
    
    expect(board.isCreatingStory).toBe(false);
  });

  it('prevents editing a user story if the sprint is "Done"', () => {
    component.sprint = { ...FAKE_SPRINT_BOARDS['1'].sprint, status: 'Done' };
    const board = component as unknown as {
      onOpenStory: (story: (typeof FAKE_SPRINT_BOARDS)['1']['userStories'][number]) => void;
      isEditingStory: boolean;
    };
    const story = FAKE_SPRINT_BOARDS['1'].userStories[0];

    board.isEditingStory = false;
    board.onOpenStory(story);

    expect(board.isEditingStory).toBe(false);
  });

  it('prevents saving a user story if the sprint is "Done"', () => {
    component.sprint = { ...FAKE_SPRINT_BOARDS['1'].sprint, status: 'Done' };
    const board = component as unknown as {
      saveStory: () => void;
      editingStoryId: string;
      editStoryError: string;
    };
    
    board.editingStoryId = '1';
    board.saveStory();
    
    expect(board.editStoryError).toBe(''); // Stays empty
  });

  it('finishes the sprint successfully and updates the status', async () => {
    const finishSprintMock = vi.fn().mockResolvedValue({
      ...FAKE_SPRINT_BOARDS['1'].sprint,
      status: 'Done',
    });
    mockSprintService.finishSprint = finishSprintMock;
    
    component.sprint = { ...FAKE_SPRINT_BOARDS['1'].sprint, status: 'InProgress' };
    
    const board = component as unknown as {
      finishSprint: () => Promise<void>;
      isFinishingSprint: boolean;
    };

    await board.finishSprint();

    expect(finishSprintMock).toHaveBeenCalledWith('1');
    expect(component.sprint!.status).toBe('Done');
    expect(board.isFinishingSprint).toBe(false);
  });

  it('handles errors when finishing the sprint fails', async () => {
    const finishSprintMock = vi.fn().mockRejectedValue(new Error('Backend error'));
    mockSprintService.finishSprint = finishSprintMock;
    
    component.sprint = { ...FAKE_SPRINT_BOARDS['1'].sprint, status: 'InProgress' };
    
    const board = component as unknown as {
      finishSprint: () => Promise<void>;
      finishSprintError: string;
      isFinishingSprint: boolean;
    };

    await board.finishSprint();

    expect(finishSprintMock).toHaveBeenCalledWith('1');
    expect(component.sprint!.status).toBe('InProgress');
    expect(board.finishSprintError).toBe('Failed to finish sprint. Please try again.');
    expect(board.isFinishingSprint).toBe(false);
  });
});
