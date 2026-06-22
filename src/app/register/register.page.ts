import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
})
export class RegisterPage implements OnInit, OnDestroy {
  form!: FormGroup;
  error = '';
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => { if (this.error) this.error = ''; });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.loading || this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    try {
      const result = await this.auth.register(email, password);
      if (result.success) {
        await this.showSuccessAlert();
        this.router.navigate(['/login']);
      } else {
        this.error = result.error || 'Error al crear la cuenta.';
        await this.showErrorAlert(this.error);
      }
    } catch {
      this.error = 'Error de conexión. Intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  private async showSuccessAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Cuenta creada',
      message: 'Tu cuenta se ha registrado exitosamente. Ahora puedes iniciar sesión.',
      buttons: ['Continuar'],
      cssClass: 'auth-alert',
    });
    await alert.present();
  }

  private async showErrorAlert(message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message,
      buttons: ['Entendido'],
      cssClass: 'auth-alert',
    });
    await alert.present();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  get emailControl() { return this.form.get('email'); }
  get passwordControl() { return this.form.get('password'); }
  get confirmPasswordControl() { return this.form.get('confirmPassword'); }
  get hasPasswordMismatch(): boolean {
    return this.form.errors?.['passwordMismatch'] && this.confirmPasswordControl?.touched || false;
  }
}
