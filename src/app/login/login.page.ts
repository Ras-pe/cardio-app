import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {
  form: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.error = '';
    if (this.form.valid) {
      const success = this.auth.login(
        this.form.value.email,
        this.form.value.password
      );
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.error = 'Credenciales inválidas. Intenta de nuevo.';
      }
    }
  }
}
