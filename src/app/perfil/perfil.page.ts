import { Component } from '@angular/core';
import { AuthService, UserRole } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: 'perfil.page.html',
  styleUrls: ['perfil.page.scss'],
})
export class PerfilPage {
  userEmail = this.auth.getUserEmail();
  userRole = this.auth.getUserRole();

  constructor(private auth: AuthService) {}

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      user: 'Usuario',
    };
    return labels[role];
  }

  logout() {
    this.auth.logout();
  }
}
