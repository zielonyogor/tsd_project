import * as api from '../data/backend-api';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
    loginUser(name: string, password: string) { return api.loginUserFromBackend(name, password); }
    registerUser(name: string, password: string) { return api.registerUserFromBackend(name, password); }
}