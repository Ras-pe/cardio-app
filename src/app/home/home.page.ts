import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { DataService, Evaluacion } from '../services/data.service';

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
    { icon: 'body-outline', value: '--', label: 'IMC', color: 'tertiary' },
    { icon: 'water-outline', value: '--', label: 'Glucosa', color: 'success' },
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

    this.riskScore = this.calculateRisk(ev);
    this.riskLevel = this.getRiskLevel(this.riskScore);
    this.riskColor = this.getRiskColor(this.riskScore);

    this.quickStats = [
      { icon: 'heart-outline', value: `${ev.presion_arterial}`, label: 'Presión Arterial', color: 'danger' },
      { icon: 'pulse-outline', value: `${ev.fc_maxima}`, label: 'FC Máxima', color: 'primary' },
      { icon: 'body-outline', value: `${ev.imc}`, label: 'IMC', color: 'tertiary' },
      { icon: 'water-outline', value: ev.glucosa_sangre ? `${ev.glucosa_sangre}` : '--', label: 'Glucosa', color: 'success' },
    ];
  }

  private calculateRisk(ev: Evaluacion): number {
    let score = 0;

    if (ev.edad > 55) score += 15;
    else if (ev.edad > 45) score += 10;
    else if (ev.edad > 35) score += 5;

    if (ev.sexo === 'masculino') score += 5;

    if (ev.presion_arterial > 140) score += 15;
    else if (ev.presion_arterial > 130) score += 10;
    else if (ev.presion_arterial > 120) score += 5;

    if (ev.colesterol > 240) score += 15;
    else if (ev.colesterol > 200) score += 10;
    else if (ev.colesterol > 180) score += 5;

    if (ev.imc > 30) score += 10;
    else if (ev.imc > 25) score += 5;

    if (ev.diabetes) score += 10;
    if (ev.hipertension) score += 10;
    if (ev.tabaquismo) score += 10;
    if (ev.antecedentes_familiares) score += 5;

    if (ev.actividad_fisica === 'sedentario') score += 5;

    return Math.min(score, 100);
  }

  private getRiskLevel(score: number): string {
    if (score >= 70) return 'Alto';
    if (score >= 40) return 'Moderado';
    if (score > 0) return 'Bajo';
    return 'Sin datos';
  }

  private getRiskColor(score: number): string {
    if (score >= 70) return 'danger';
    if (score >= 40) return 'warning';
    if (score > 0) return 'success';
    return 'medium';
  }

  logout() {
    this.auth.logout();
  }
}
