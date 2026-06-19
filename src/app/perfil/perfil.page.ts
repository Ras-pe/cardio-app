import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: 'perfil.page.html',
  styleUrls: ['perfil.page.scss'],
})
export class PerfilPage {
  userEmail = this.auth.getUserEmail();

  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
