import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { FAKE_SPRINT_BOARDS } from '../../data/fake-sprint-boards';

import { Board } from './board';

describe('Board', () => {
  let component: Board;
  let fixture: ComponentFixture<Board>;
  let navigateCalls: unknown[][];
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    navigateCalls = [];
    paramMapSubject = new BehaviorSubject(convertToParamMap({ id: '1' }));

    await TestBed.configureTestingModule({
      imports: [Board],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: (...commands: unknown[]) => {
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads sprint data from the route param id', () => {
    expect(component.sprint).toEqual(FAKE_SPRINT_BOARDS['1'].sprint);
    expect(component.getUserStoriesForColumn('To Do')).toEqual([
      FAKE_SPRINT_BOARDS['1'].userStories[0],
    ]);
    expect(navigateCalls).toEqual([]);
  });

  it('redirects to home when no board id is provided', async () => {
    paramMapSubject.next(convertToParamMap({}));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateCalls).toContainEqual([['/']]);
  });

  it('redirects to home when the board id does not exist', async () => {
    paramMapSubject.next(convertToParamMap({ id: '999' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateCalls).toContainEqual([['/']]);
  });

  it('renders the selected sprint goal and user stories', () => {
    const element = fixture.nativeElement as HTMLElement;
    const title = element.querySelector('.sprint-goal');
    const storyCards = element.querySelectorAll('app-user-story-card');

    expect(title?.textContent).toContain('Make MVP');
    expect(storyCards.length).toBe(FAKE_SPRINT_BOARDS['1'].userStories.length);
  });

  it('creates a new user story with all UserStory fields', () => {
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

    const doneStories = component.getUserStoriesForColumn('Done');
    const createdStory = doneStories[doneStories.length - 1];

    expect(doneStories.length).toBe(initialCount + 1);
    expect(createdStory.title).toBe('New flow for checkout');
    expect(createdStory.description).toBe('As a user, I want a faster checkout flow.');
    expect(createdStory.status).toBe('Done');
    expect(createdStory.sprintId).toBe(component.sprint.id);
    expect(createdStory.id).toMatch(/^[0-9]+$/);
  });

  it('opens an existing user story for editing and saves changes', () => {
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
    const story = FAKE_SPRINT_BOARDS['1'].userStories[0];

    board.onOpenStory(story);
    board.editStoryForm.title = 'Updated story title';
    board.editStoryForm.description = 'Updated story description';
    board.editStoryForm.status = 'Blocked';
    board.saveStory();

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

  it('resets form between creating multiple stories in succession', () => {
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

    // Create second story
    board.onAddStory();

    expect(board.newStoryForm.title).toBe('');
    expect(board.newStoryForm.description).toBe('');
    expect(board.newStoryForm.status).toBe('To Do');

    board.newStoryForm.title = 'Second story';
    board.newStoryForm.description = 'Second description';
    board.newStoryForm.status = 'In Progress';
    board.createStory();

    const inProgressStories = component.getUserStoriesForColumn('In Progress');
    const lastStory = inProgressStories[inProgressStories.length - 1];

    expect(lastStory.title).toBe('Second story');
    expect(lastStory.description).toBe('Second description');
  });
});
