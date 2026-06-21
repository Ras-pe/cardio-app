import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  form!: FormGroup;
  error = '';
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.error) this.error = '';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSubmit(): Promise<void> {
    if (this.loading || this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const { email, password } = this.form.value;

    try {
      const result = await this.auth.login(email, password);

      if (result.success) {
        this.router.navigate(['/home']);
      } else {
        this.error = result.error || 'Credenciales inválidas.';
        this.form.get('password')?.reset();
      }
    } catch {
      this.error = 'Error de conexión. Intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  get emailControl() {
    return this.form.get('email');
  }

  get passwordControl() {
    return this.form.get('password');
  }
}
