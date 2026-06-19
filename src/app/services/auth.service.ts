import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = false;
  private userEmail = '';

  constructor(private router: Router) {
    const saved = localStorage.getItem('cardio-auth');
    if (saved) {
      const data = JSON.parse(saved);
      this.authenticated = data.authenticated;
      this.userEmail = data.userEmail;
    }
  }

  login(email: string, password: string): boolean {
    if (email === 'admin@test.com' && password === '123456') {
      this.authenticated = true;
      this.userEmail = email;
      localStorage.setItem('cardio-auth', JSON.stringify({
        authenticated: true,
        userEmail: email
      }));
      return true;
    }
    return false;
  }

  logout() {
    this.authenticated = false;
    this.userEmail = '';
    localStorage.removeItem('cardio-auth');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  getUserEmail(): string {
    return this.userEmail;
  }
}
