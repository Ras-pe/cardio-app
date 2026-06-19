import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  userEmail = this.auth.getUserEmail();
  riskScore = 72;
  riskLevel = 'Moderado';
  riskColor = 'warning';

  quickStats = [
    { icon: 'heart-outline', value: '--', label: 'Presión Arterial', color: 'danger' },
    { icon: 'pulse-outline', value: '--', label: 'FC Máxima', color: 'primary' },
    { icon: 'body-outline', value: '--', label: 'IMC', color: 'tertiary' },
    { icon: 'water-outline', value: '--', label: 'Glucosa', color: 'success' },
  ];

  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
