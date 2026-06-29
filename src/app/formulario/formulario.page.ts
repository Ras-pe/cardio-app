import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { ApiService, HeartFeaturesNew, PredictionResult } from '../services/api.service';
import { ConfigService } from '../services/config.service';
import { ResultadoPrediccionComponent } from '../resultado-prediccion/resultado-prediccion.component';

@Component({
  selector: 'app-formulario',
  templateUrl: 'formulario.page.html',
  styleUrls: ['formulario.page.scss'],
})
export class FormularioPage implements OnInit {
  form!: FormGroup;
  submitting = false;

  sexos = [
    { value: 'F', label: 'Femenino' },
    { value: 'M', label: 'Masculino' },
  ];

  tiposDolor = [
    { value: 'ATA', label: 'Angina típica' },
    { value: 'NAP', label: 'Angina atípica' },
    { value: 'ASY', label: 'Asintomático' },
    { value: 'TA', label: 'Dolor no anginal' },
  ];

  tiposEcg = [
    { value: 'Normal', label: 'Normal' },
    { value: 'ST', label: 'Anomalía ST-T' },
    { value: 'LVH', label: 'Hipertrofia ventricular izquierda' },
  ];

  pendientesSt = [
    { value: 'Up', label: 'Ascendente' },
    { value: 'Flat', label: 'Plana' },
    { value: 'Down', label: 'Descendente' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalCtrl: ModalController,
    private dataService: DataService,
    private apiService: ApiService,
    private config: ConfigService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nombre_paciente: [''],
      telefono_paciente: [''],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      sexo: [null, Validators.required],
      presion_arterial: ['', [Validators.required, Validators.min(80), Validators.max(250)]],
      colesterol: ['', [Validators.required, Validators.min(100), Validators.max(600)]],
      fc_maxima: ['', [Validators.required, Validators.min(60), Validators.max(250)]],
      ayunas_glucosa_alta: [false],
      tipo_dolor_pecho: [null, Validators.required],
      angina_ejercicio: [false],
      ecg_reposo: [null, Validators.required],
      depresion_st: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      pendiente_st: [null, Validators.required],
    });
  }

  private formToEvalData(): any {
    const v = this.form.value;
    return {
      nombre_paciente: v.nombre_paciente?.trim() || '',
      telefono_paciente: v.telefono_paciente?.trim() || '',
      edad: Number(v.edad),
      sexo: v.sexo,
      presion_arterial: Number(v.presion_arterial),
      colesterol: Number(v.colesterol),
      fc_maxima: Number(v.fc_maxima),
      tipo_dolor_pecho: v.tipo_dolor_pecho,
      ayunas_glucosa_alta: !!v.ayunas_glucosa_alta,
      ecg_reposo: v.ecg_reposo,
      angina_ejercicio: !!v.angina_ejercicio,
      depresion_st: Number(v.depresion_st),
      pendiente_st: v.pendiente_st,
    };
  }

  private formToHeartFeatures(): HeartFeaturesNew {
    const v = this.form.value;
    return {
      age: Number(v.edad),
      sex: v.sexo,
      chestPainType: v.tipo_dolor_pecho,
      restingBP: Number(v.presion_arterial),
      cholesterol: Number(v.colesterol),
      fastingBS: v.ayunas_glucosa_alta ? 1 : 0,
      restingECG: v.ecg_reposo,
      maxHR: Number(v.fc_maxima),
      exerciseAngina: v.angina_ejercicio ? 'Y' : 'N',
      oldpeak: Number(v.depresion_st),
      stSlope: v.pendiente_st,
    };
  }

  async onSubmit() {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;

    const evalData = this.formToEvalData();
    const evaluacion = this.dataService.addEvaluacion(evalData);

    const features = this.formToHeartFeatures();

    this.apiService.predict(features).subscribe({
      next: async (result) => {
        if (result) {
          this.guardarPrediccion(evaluacion, result, 'ML');
          await this.mostrarResultadoML(evaluacion, result);
        } else {
          await this.mostrarResultadoFallback(evaluacion);
        }
        this.submitting = false;
        this.router.navigate(['/home']);
      },
      error: async () => {
        await this.mostrarResultadoFallback(evaluacion);
        this.submitting = false;
        this.router.navigate(['/home']);
      },
    });
  }

  private async mostrarResultadoML(evaluacion: any, result: PredictionResult) {
    const modal = await this.modalCtrl.create({
      component: ResultadoPrediccionComponent,
      componentProps: {
        riskScore: result.probability_risk,
        riskLevel: result.risk_level,
        riskColor: result.risk_level === 'Alto' ? 'danger' : result.risk_level === 'Moderado' ? 'warning' : 'success',
        evaluacion,
        prediccion: result,
        esML: true,
        servidor: this.config.getActiveUrl(),
      },
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  private async mostrarResultadoFallback(evaluacion: any) {
    const riskScore = this.dataService.calculateRisk(evaluacion);
    const riskLevel = this.dataService.getRiskLevel(riskScore);
    const riskColor = this.dataService.getRiskColor(riskScore);

    const fallbackResult = {
      prediction: riskScore >= 50 ? 1 : 0,
      label: riskScore >= 50 ? 'Riesgo de enfermedad cardíaca' : 'Sin riesgo significativo',
      probability_risk: riskScore,
      probability_no_risk: 100 - riskScore,
      risk_level: riskLevel,
    };
    this.guardarPrediccion(evaluacion, fallbackResult as any, 'local');

    const modal = await this.modalCtrl.create({
      component: ResultadoPrediccionComponent,
      componentProps: {
        riskScore,
        riskLevel,
        riskColor,
        evaluacion,
        esML: false,
        servidor: 'local',
      },
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  private guardarPrediccion(evaluacion: any, result: PredictionResult, source: 'ML' | 'local') {
    this.dataService.addPrediccion({
      evaluacionId: evaluacion.id,
      fecha: evaluacion.fecha,
      paciente: evaluacion.nombre_paciente?.trim() || 'Paciente',
      telefono: evaluacion.telefono_paciente?.trim() || undefined,
      prediction: result.prediction,
      label: result.label,
      probability_risk: result.probability_risk,
      probability_no_risk: result.probability_no_risk,
      risk_level: result.risk_level,
      source,
    });
  }
}
