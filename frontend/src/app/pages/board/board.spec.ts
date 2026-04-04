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
    expect((component as any).sprint).toEqual(FAKE_SPRINT_BOARDS['1'].sprint);
    expect((component as any).getUserStoriesForColumn('To Do')).toEqual([
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
});
