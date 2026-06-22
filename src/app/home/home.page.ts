import { Component } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter {
  userEmail = '';
  riskScore = 0;
  riskLevel = 'Sin datos';
  riskColor = 'medium';

  quickStats = [
    { icon: 'heart-outline', value: '--', label: 'Presión Arterial', color: 'danger' },
    { icon: 'pulse-outline', value: '--', label: 'FC Máxima', color: 'primary' },
    { icon: 'flask-outline', value: '--', label: 'Colesterol', color: 'tertiary' },
    { icon: 'person-outline', value: '--', label: 'Edad', color: 'success' },
  ];

  constructor(
    private auth: AuthService,
    private dataService: DataService,
  ) {}

  ionViewWillEnter(): void {
    this.userEmail = this.auth.getUserEmail();
    this.loadLastEvaluation();
  }

  private loadLastEvaluation(): void {
    const ev = this.dataService.getUltimaEvaluacion();
    if (!ev) return;

    this.riskScore = this.dataService.calculateRisk(ev);
    this.riskLevel = this.dataService.getRiskLevel(this.riskScore);
    this.riskColor = this.dataService.getRiskColor(this.riskScore);

    this.quickStats = [
      { icon: 'heart-outline', value: `${ev.presion_arterial}`, label: 'Presión Arterial', color: 'danger' },
      { icon: 'pulse-outline', value: `${ev.fc_maxima}`, label: 'FC Máxima', color: 'primary' },
      { icon: 'flask-outline', value: `${ev.colesterol}`, label: 'Colesterol', color: 'tertiary' },
      { icon: 'person-outline', value: `${ev.edad}`, label: 'Edad', color: 'success' },
    ];
  }

  logout() {
    this.auth.logout();
  }
}
