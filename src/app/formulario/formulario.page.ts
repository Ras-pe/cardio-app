import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { ApiService, HeartFeatures, PredictionResult } from '../services/api.service';
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
    { value: 0, label: 'Femenino' },
    { value: 1, label: 'Masculino' },
  ];

  tiposDolor = [
    { value: 0, label: 'Asintomático' },
    { value: 1, label: 'Angina atípica' },
    { value: 2, label: 'Dolor no anginal' },
    { value: 3, label: 'Angina típica' },
  ];

  tiposEcg = [
    { value: 0, label: 'Normal' },
    { value: 1, label: 'Anomalía ST-T' },
    { value: 2, label: 'Hipertrofia ventricular izquierda' },
  ];

  pendientesSt = [
    { value: 0, label: 'Ascendente' },
    { value: 1, label: 'Plana' },
    { value: 2, label: 'Descendente' },
  ];

  opcionesVasos = [
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
  ];

  opcionesThal = [
    { value: 0, label: 'Normal' },
    { value: 1, label: 'Defecto fijo' },
    { value: 2, label: 'Defecto reversible' },
    { value: 3, label: 'No determinado' },
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
      vasos_coloreados: [null, Validators.required],
      talasemia: [null, Validators.required],
    });
  }

  private formToEvalData(): any {
    const v = this.form.value;
    return {
      nombre_paciente: v.nombre_paciente?.trim() || '',
      telefono_paciente: v.telefono_paciente?.trim() || '',
      edad: Number(v.edad),
      sexo: Number(v.sexo),
      presion_arterial: Number(v.presion_arterial),
      colesterol: Number(v.colesterol),
      fc_maxima: Number(v.fc_maxima),
      tipo_dolor_pecho: Number(v.tipo_dolor_pecho),
      ayunas_glucosa_alta: !!v.ayunas_glucosa_alta,
      ecg_reposo: Number(v.ecg_reposo),
      angina_ejercicio: !!v.angina_ejercicio,
      depresion_st: Number(v.depresion_st),
      pendiente_st: Number(v.pendiente_st),
      vasos_coloreados: Number(v.vasos_coloreados),
      talasemia: Number(v.talasemia),
    };
  }

  private formToHeartFeatures(): HeartFeatures {
    const v = this.form.value;
    return {
      age: Number(v.edad),
      sex: Number(v.sexo),
      cp: Number(v.tipo_dolor_pecho),
      trestbps: Number(v.presion_arterial),
      chol: Number(v.colesterol),
      fbs: v.ayunas_glucosa_alta ? 1 : 0,
      restecg: Number(v.ecg_reposo),
      thalach: Number(v.fc_maxima),
      exang: v.angina_ejercicio ? 1 : 0,
      oldpeak: Number(v.depresion_st),
      slope: Number(v.pendiente_st),
      ca: Number(v.vasos_coloreados),
      thal: Number(v.talasemia),
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
