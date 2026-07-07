import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'admin' | 'user';

export interface AuthToken {
  token: string;
  email: string;
  role: UserRole;
  expiresAt: number;
}

export interface RegisteredUser {
  email: string;
  password: string;
  nombre: string;
  role: UserRole;
  activo: boolean;
  fechaCreacion: string;
}

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
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
    { email: 'admin@test.com', password: 'Admin@123', nombre: 'Administrador', role: 'admin', activo: true, fechaCreacion: '2026-01-01' },
    { email: 'user@test.com', password: 'User@123', nombre: 'Usuario Demo', role: 'user', activo: true, fechaCreacion: '2026-01-01' },
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

    if (!user.activo) {
      return { success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' };
    }

    const token = this.generateToken();
    const authData: AuthToken = {
      token,
      email: user.email,
      role: user.role,
      expiresAt: Date.now() + this.TOKEN_DURATION,
    };

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(authData));

    return { success: true };
  }

  async createUser(data: { email: string; password: string; nombre: string; role: UserRole }): Promise<{ success: boolean; error?: string }> {
    await this.simulateDelay();

    if (!data.email || !data.password || !data.nombre) {
      return { success: false, error: 'Todos los campos son obligatorios.' };
    }

    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.errors.join('. ') + '.' };
    }

    const users = this.getUsers();
    const exists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Este correo ya está registrado.' };
    }

    const newUser: RegisteredUser = {
      email: data.email.toLowerCase(),
      password: data.password,
      nombre: data.nombre.trim(),
      role: data.role,
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0],
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    return { success: true };
  }

  async updateUser(email: string, data: Partial<Pick<RegisteredUser, 'nombre' | 'role' | 'activo'>>): Promise<{ success: boolean; error?: string }> {
    await this.simulateDelay();

    const users = this.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    if (data.nombre !== undefined) users[index].nombre = data.nombre.trim();
    if (data.role !== undefined) users[index].role = data.role;
    if (data.activo !== undefined) users[index].activo = data.activo;

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return { success: true };
  }

  async changePassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    await this.simulateDelay();

    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.errors.join('. ') + '.' };
    }

    const users = this.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    users[index].password = newPassword;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return { success: true };
  }

  deleteUser(email: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    if (filtered.length === users.length) return false;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(filtered));
    return true;
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

  getUserRole(): UserRole {
    const session = this.getSession();
    return session?.role ?? 'user';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
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

  getUserByEmail(email: string): RegisteredUser | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos una minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Al menos un número');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
      errors.push('Al menos un carácter especial (!@#$%^&*...)');
    }

    return { valid: errors.length === 0, errors };
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
        return;
      }
      const needsMigration = users.some(u => !u.role || !u.nombre || u.activo === undefined);
      if (needsMigration) {
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
