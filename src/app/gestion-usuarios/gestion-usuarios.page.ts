import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService, RegisteredUser, UserRole } from '../services/auth.service';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.page.html',
  styleUrls: ['./gestion-usuarios.page.scss'],
})
export class GestionUsuariosPage {
  users: RegisteredUser[] = [];
  showCreateForm = false;
  showEditModal = false;
  editingUser: RegisteredUser | null = null;

  formNombre = '';
  formEmail = '';
  formPassword = '';
  formRole: UserRole = 'user';
  showPassword = false;

  passwordValidation = { valid: true, errors: [] as string[] };

  get pwHasLength() { return this.formPassword.length >= 8; }
  get pwHasUpper() { return /[A-Z]/.test(this.formPassword); }
  get pwHasLower() { return /[a-z]/.test(this.formPassword); }
  get pwHasDigit() { return /[0-9]/.test(this.formPassword); }
  get pwHasSpecial() { return /[^A-Za-z0-9]/.test(this.formPassword); }

  constructor(
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users = this.auth.getUsers();
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      user: 'Usuario',
    };
    return labels[role];
  }

  getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      admin: 'warning',
      user: 'primary',
    };
    return colors[role];
  }

  onPasswordChange(): void {
    this.passwordValidation = this.auth.validatePassword(this.formPassword);
  }

  get canSave(): boolean {
    return !!this.formNombre && !!this.formEmail && this.passwordValidation.valid && !!this.formPassword;
  }

  get canSaveEdit(): boolean {
    return !!this.formNombre && !!this.formRole;
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.formNombre = '';
    this.formEmail = '';
    this.formPassword = '';
    this.formRole = 'user';
    this.showPassword = false;
    this.passwordValidation = { valid: true, errors: [] };
  }

  cancelCreate(): void {
    this.showCreateForm = false;
  }

  async createUser(): Promise<void> {
    if (!this.canSave) return;

    const result = await this.auth.createUser({
      email: this.formEmail,
      password: this.formPassword,
      nombre: this.formNombre,
      role: this.formRole,
    });

    if (result.success) {
      const toast = await this.toastCtrl.create({
        message: `Usuario "${this.formNombre}" creado exitosamente`,
        duration: 2500,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
      this.showCreateForm = false;
      this.loadUsers();
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: result.error || 'No se pudo crear el usuario.',
        buttons: ['Entendido'],
      });
      await alert.present();
    }
  }

  openEditModal(user: RegisteredUser): void {
    this.editingUser = user;
    this.formNombre = user.nombre;
    this.formRole = user.role;
    this.showEditModal = true;
  }

  cancelEdit(): void {
    this.showEditModal = false;
    this.editingUser = null;
  }

  async saveEdit(): Promise<void> {
    if (!this.editingUser || !this.canSaveEdit) return;

    const result = await this.auth.updateUser(this.editingUser.email, {
      nombre: this.formNombre,
      role: this.formRole,
    });

    if (result.success) {
      const toast = await this.toastCtrl.create({
        message: 'Usuario actualizado',
        duration: 2500,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
      this.showEditModal = false;
      this.editingUser = null;
      this.loadUsers();
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: result.error || 'No se pudo actualizar.',
        buttons: ['Entendido'],
      });
      await alert.present();
    }
  }

  async toggleActive(user: RegisteredUser): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: user.activo ? 'Desactivar usuario' : 'Activar usuario',
      message: `¿Estás seguro de ${user.activo ? 'desactivar' : 'activar'} a "${user.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: user.activo ? 'Desactivar' : 'Activar',
          handler: async () => {
            await this.auth.updateUser(user.email, { activo: !user.activo });
            this.loadUsers();
            const toast = await this.toastCtrl.create({
              message: user.activo ? 'Usuario desactivado' : 'Usuario activado',
              duration: 2000,
              color: 'success',
              position: 'bottom',
            });
            await toast.present();
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteUser(user: RegisteredUser): Promise<void> {
    if (this.isCurrentUser(user.email)) {
      const alert = await this.alertCtrl.create({
        header: 'No permitido',
        message: 'No puedes eliminar tu propia cuenta.',
        buttons: ['Entendido'],
      });
      await alert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar usuario',
      message: `¿Estás seguro de eliminar a "${user.nombre}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.auth.deleteUser(user.email);
            this.loadUsers();
            this.toastCtrl.create({
              message: 'Usuario eliminado',
              duration: 2000,
              color: 'success',
              position: 'bottom',
            }).then(t => t.present());
          },
        },
      ],
    });
    await alert.present();
  }

  isCurrentUser(email: string): boolean {
    return this.auth.getUserEmail().toLowerCase() === email.toLowerCase();
  }
}
