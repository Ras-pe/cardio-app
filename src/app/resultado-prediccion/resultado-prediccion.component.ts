import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PredictionResult, ApiService, RecommendationResult } from '../services/api.service';

@Component({
  selector: 'app-resultado-prediccion',
  templateUrl: './resultado-prediccion.component.html',
  styleUrls: ['./resultado-prediccion.component.scss'],
})
export class ResultadoPrediccionComponent implements OnInit {
  @Input() riskScore = 0;
  @Input() riskLevel = '';
  @Input() riskColor = '';
  @Input() evaluacion: any = null;
  @Input() prediccion: PredictionResult | null = null;
  @Input() esML = false;
  @Input() servidor = '';

  recommendation: RecommendationResult | null = null;
  loadingRecommendation = false;

  circumference = 339.292;

  get urgencyClass(): string {
    const map: Record<string, string> = {
      'inmediata': 'urgency-inmediata',
      'en pocas horas': 'urgency-pocas-horas',
      'ambulatoria': 'urgency-ambulatoria',
    };
    return map[this.recommendation?.urgency || ''] || '';
  }

  get dashOffset(): number {
    return this.circumference * (1 - this.riskScore / 100);
  }

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    this.loadRecommendation();
  }

  private levelMap: Record<string, string> = {
    Alto: 'critical',
    Moderado: 'moderate',
    Bajo: 'low',
  };

  private rhythmMap: Record<string, string> = {
    Normal: 'Sinusal',
    ST: 'Alteración del segmento ST',
    LVH: 'Sinusal con hipertrofia ventricular',
  };

  private loadRecommendation() {
    const body = {
      riskLevel: this.levelMap[this.riskLevel] || 'low',
      riskScore: Math.round(this.riskScore),
      detectedRhythm:
        this.evaluacion?.ecg_reposo
          ? this.rhythmMap[this.evaluacion.ecg_reposo] || this.evaluacion.ecg_reposo
          : 'No especificado',
      troponinI: 0,
      confidence: Math.round(this.prediccion?.probability_risk || this.riskScore),
    };

    this.loadingRecommendation = true;
    this.apiService.getRecommendation(body).subscribe({
      next: (result) => {
        this.recommendation = result;
        this.loadingRecommendation = false;
      },
      error: () => {
        this.loadingRecommendation = false;
      },
    });
  }

  irAlInicio() {
    this.modalCtrl.dismiss();
    this.router.navigate(['/home']);
  }
}
