import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { clearCurrentUser, getCurrentUser, saveCurrentUser } from '../../data/user-storage';
import { UserService } from '../../services/user.service';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let navigateSpy: any;

  const mockUserService = {
    loginUser: vi.fn(),
  };

  beforeEach(async () => {
    clearCurrentUser();
    vi.clearAllMocks();

    mockUserService.loginUser.mockResolvedValue({ id: 9, name: 'Alicja' });

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: UserService, useValue: mockUserService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    const routerInstance = TestBed.inject(Router);
    navigateSpy = vi.spyOn(routerInstance, 'navigate').mockResolvedValue(true);

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

    const routerInstance = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(routerInstance, 'navigate').mockResolvedValue(true);

    const localFixture = TestBed.createComponent(Login);
    localFixture.detectChanges();
    await localFixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('shows validation when the username is empty', async () => {
    const login = component as unknown as {
      userName: string;
      password: string;
      loginError: string;
      isLoggingIn: boolean;
      login: () => Promise<void>;
    };

    login.userName = '   ';
    login.password = 'test';

    await login.login();

    expect(login.loginError).toBe('Enter your username.');
    expect(login.isLoggingIn).toBe(false);
    expect(mockUserService.loginUser).not.toHaveBeenCalled();
  });

  it('creates the user, stores it, and navigates home', async () => {
    const login = component as unknown as {
      userName: string;
      password: string;
      loginError: string;
      isLoggingIn: boolean;
      login: () => Promise<void>;
    };
    
    const routerInstance = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(routerInstance, 'navigate').mockResolvedValue(true);

    login.userName = 'Alicja';
    login.password = 'password';

    await login.login();

    expect(mockUserService.loginUser).toHaveBeenCalledWith('Alicja', 'password');
    expect(getCurrentUser()).toEqual({ id: 9, name: 'Alicja' });
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
    expect(login.loginError).toBe('');
    expect(login.isLoggingIn).toBe(false);
  });

  it('shows an error when login fails', async () => {
    mockUserService.loginUser.mockRejectedValueOnce(new Error('network error'));

    const login = component as unknown as {
      userName: string;
      password: string;
      loginError: string;
      isLoggingIn: boolean;
      login: () => Promise<void>;
    };

    login.userName = 'Alicja';
    login.password = 'wrong-password';

    await login.login();

    expect(login.loginError).toBe('Could not log in. Please try again.');
    expect(login.isLoggingIn).toBe(false);
  });
});