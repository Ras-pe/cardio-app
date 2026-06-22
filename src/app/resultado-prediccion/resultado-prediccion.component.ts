import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PredictionResult } from '../services/api.service';

@Component({
  selector: 'app-resultado-prediccion',
  templateUrl: './resultado-prediccion.component.html',
  styleUrls: ['./resultado-prediccion.component.scss'],
})
export class ResultadoPrediccionComponent {
  @Input() riskScore = 0;
  @Input() riskLevel = '';
  @Input() riskColor = '';
  @Input() evaluacion: any = null;
  @Input() prediccion: PredictionResult | null = null;
  @Input() esML = false;
  @Input() servidor = '';

  circumference = 339.292;

  get dashOffset(): number {
    return this.circumference * (1 - this.riskScore / 100);
  }

  constructor(private modalCtrl: ModalController, private router: Router) {}

  irAlInicio() {
    this.modalCtrl.dismiss();
    this.router.navigate(['/home']);
  }
}
