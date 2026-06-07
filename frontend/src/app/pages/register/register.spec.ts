import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { clearCurrentUser } from '../../data/user-storage';
import { UserService } from '../../services/user.service';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  const mockUserService = {
    registerUser: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockUserService.registerUser.mockResolvedValue({ id: 1, name: 'Kasia' });

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        { provide: UserService, useValue: mockUserService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
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

  it('shows validation when passwords do not match', async () => {
    const register = component as unknown as {
      userName: string;
      password: string;
      confirmPassword: string;
      registerError: string;
      isRegistering: boolean;
      register: () => Promise<void>;
    };

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    register.userName = 'Kasia';
    register.password = 'password1';
    register.confirmPassword = 'password2';
    
    await register.register();
    expect(alertSpy).toHaveBeenCalledWith('Passwords do not match!');
    expect(mockUserService.registerUser).not.toHaveBeenCalled();
  });

  it('registers user and navigates to login on success', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const register = component as unknown as {
      userName: string;
      password: string;
      confirmPassword: string;
      registerError: string;
      isRegistering: boolean;
      register: () => Promise<void>;
    };
    
    const routerInstance = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(routerInstance, 'navigate').mockResolvedValue(true);

    register.userName = 'Kasia';
    register.password = 'password';
    register.confirmPassword = 'password';

    await register.register();
    expect(mockUserService.registerUser).toHaveBeenCalledWith('Kasia', 'password');
    expect(alertSpy).toHaveBeenCalledWith('Registration successful!');
    
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});