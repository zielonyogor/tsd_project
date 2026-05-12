import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { clearCurrentUser, getCurrentUser, saveCurrentUser } from '../../data/user-storage';
import { SprintService } from '../../services/sprint.service';

import { Join } from './join';

describe('Join', () => {
  let component: Join;
  let fixture: ComponentFixture<Join>;

  const mockSprintService = {
    joinSprint: vi.fn(),
  };

  const router = {
    navigate: vi.fn(() => Promise.resolve(true)),
  };

  const activatedRoute = {
    paramMap: {
      subscribe: (callback: (paramMap: ReturnType<typeof convertToParamMap>) => void) => {
        callback(convertToParamMap({ code: 'SPRINT-42' }));
        return { unsubscribe: () => undefined };
      },
    },
  };

  beforeEach(async () => {
    clearCurrentUser();
    vi.clearAllMocks();

    mockSprintService.joinSprint.mockResolvedValue({ id: 'board-123' });

    saveCurrentUser({ id: 7, name: 'Alicja' });

    await TestBed.configureTestingModule({
      imports: [Join],
      providers: [
        { provide: SprintService, useValue: mockSprintService },
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Join);
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

  it('loads the current user and join code from storage and route params', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(getCurrentUser()).toEqual({ id: 7, name: 'Alicja' });
    expect((component as unknown as { joinCode: string }).joinCode).toBe('SPRINT-42');
    expect(element.querySelector('.join-page')?.textContent).toContain('Alicja');
  });

  it('redirects to login when there is no current user', async () => {
    clearCurrentUser();

    const localFixture = TestBed.createComponent(Join);
    localFixture.detectChanges();
    await localFixture.whenStable();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('shows validation when the join code is empty', async () => {
    const join = component as unknown as {
      joinCode: string;
      joinError: string;
      isJoining: boolean;
      joinSprint: () => Promise<void>;
    };

    join.joinCode = '   ';

    await join.joinSprint();

    expect(join.joinError).toBe('Enter a sprint join code.');
    expect(join.isJoining).toBe(false);
    expect(mockSprintService.joinSprint).not.toHaveBeenCalled();
  });

  it('joins the sprint and navigates to the board', async () => {
    const join = component as unknown as {
      joinCode: string;
      joinError: string;
      isJoining: boolean;
      joinSprint: () => Promise<void>;
    };

    join.joinCode = 'SPRINT-42';

    await join.joinSprint();

    expect(mockSprintService.joinSprint).toHaveBeenCalledWith('SPRINT-42', 7);
    expect(router.navigate).toHaveBeenCalledWith(['/board', 'board-123']);
    expect(join.joinError).toBe('');
    expect(join.isJoining).toBe(false);
  });

  it('goes back to the home page', () => {
    (component as unknown as { goBack: () => void }).goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});