import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { clearCurrentUser, getCurrentUser, saveCurrentUser } from '../../data/user-storage';
import { SprintService } from '../../services/sprint.service';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  const mockSprintService = {
    createUser: vi.fn(),
  };

  const router = {
    navigate: vi.fn(() => Promise.resolve(true)),
  };

  beforeEach(async () => {
    clearCurrentUser();
    vi.clearAllMocks();

    mockSprintService.createUser.mockResolvedValue({ id: 9, name: 'Alicja' });

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: SprintService, useValue: mockSprintService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
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

  it('redirects to home when a user is already stored', async () => {
    clearCurrentUser();
    saveCurrentUser({ id: 2, name: 'Existing user' });

    const localFixture = TestBed.createComponent(Login);
    localFixture.detectChanges();
    await localFixture.whenStable();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('shows validation when the username is empty', async () => {
    const login = component as unknown as {
      userName: string;
      loginError: string;
      isLoggingIn: boolean;
      login: () => Promise<void>;
    };

    login.userName = '   ';

    await login.login();

    expect(login.loginError).toBe('Enter your username.');
    expect(login.isLoggingIn).toBe(false);
    expect(mockSprintService.createUser).not.toHaveBeenCalled();
  });

  it('creates the user, stores it, and navigates home', async () => {
    const login = component as unknown as {
      userName: string;
      loginError: string;
      isLoggingIn: boolean;
      login: () => Promise<void>;
    };

    login.userName = 'Alicja';

    await login.login();

    expect(mockSprintService.createUser).toHaveBeenCalledWith('Alicja');
    expect(getCurrentUser()).toEqual({ id: 9, name: 'Alicja' });
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(login.loginError).toBe('');
    expect(login.isLoggingIn).toBe(false);
  });

  it('shows an error when login fails', async () => {
    mockSprintService.createUser.mockRejectedValueOnce(new Error('network error'));

    const login = component as unknown as {
      userName: string;
      loginError: string;
      isLoggingIn: boolean;
      login: () => Promise<void>;
    };

    login.userName = 'Alicja';

    await login.login();

    expect(login.loginError).toBe('Could not log in. Please try again.');
    expect(login.isLoggingIn).toBe(false);
  });
});