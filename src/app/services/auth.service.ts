import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthToken {
  token: string;
  email: string;
  expiresAt: number;
}

export interface RegisteredUser {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'cardio-auth-token';
  private readonly SESSION_KEY = 'cardio-auth';
  private readonly USERS_KEY = 'cardio-registered-users';
  private readonly TOKEN_DURATION = 3600000;

  private static readonly SEED_USERS: RegisteredUser[] = [
    { email: 'admin@test.com', password: '123456' },
    { email: 'user@test.com', password: 'password' },
  ];

  constructor(private router: Router) {
    this.seedUsersIfEmpty();
    this.cleanExpiredSession();
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    await this.simulateDelay();

    if (!email || !password) {
      return { success: false, error: 'Correo y contraseña son obligatorios.' };
    }

    const users = this.getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
    }

    const token = this.generateToken();
    const authData: AuthToken = {
      token,
      email: user.email,
      expiresAt: Date.now() + this.TOKEN_DURATION,
    };

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(authData));

    return { success: true };
  }

  async register(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    await this.simulateDelay();

    if (!email || !password) {
      return { success: false, error: 'Correo y contraseña son obligatorios.' };
    }

    const users = this.getUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return { success: false, error: 'Este correo ya está registrado. Intenta con otro.' };
    }

    users.push({ email: email.toLowerCase(), password });
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    return { success: true };
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.logout();
      return false;
    }
    return true;
  }

  getUserEmail(): string {
    const session = this.getSession();
    return session?.email ?? '';
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsers(): RegisteredUser[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as RegisteredUser[];
    } catch {
      localStorage.removeItem(this.USERS_KEY);
      return [];
    }
  }

  private seedUsersIfEmpty(): void {
    const raw = localStorage.getItem(this.USERS_KEY);
    if (!raw) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(AuthService.SEED_USERS));
      return;
    }
    try {
      const users = JSON.parse(raw) as RegisteredUser[];
      if (!Array.isArray(users) || users.length === 0) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(AuthService.SEED_USERS));
      }
    } catch {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(AuthService.SEED_USERS));
    }
  }

  private getSession(): AuthToken | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthToken;
    } catch {
      localStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  }

  private cleanExpiredSession(): void {
    const session = this.getSession();
    if (session && Date.now() > session.expiresAt) {
      this.logout();
    }
  }

  private generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
  }
}
