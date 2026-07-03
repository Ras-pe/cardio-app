import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { ApiService, HeartFeaturesNew, PredictionResult, EcgInterpretation } from '../services/api.service';
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
  interpretingEcg = false;
  ecgImagePreview: string | null = null;
  autoFilledFields: string[] = [];

  private readonly fieldLabels: Record<string, string> = {
    ecg_reposo: 'ECG en Reposo',
    fc_maxima: 'Frecuencia Cardíaca Máxima',
    depresion_st: 'Depresión del ST',
    pendiente_st: 'Pendiente del ST',
  };

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
    private toastCtrl: ToastController,
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

  onEcgImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.autoFilledFields = [];
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          const ratio = maxDim / Math.max(width, height);
          width *= ratio;
          height *= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        this.ecgImagePreview = compressed;
        this.sendEcgForInterpretation(compressed.split(',')[1]);
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  private sendEcgForInterpretation(base64: string): void {
    this.interpretingEcg = true;

    this.apiService.interpretEcg(base64).subscribe({
      next: (result) => {
        this.interpretingEcg = false;
        if (result && result.confidence !== null) {
          this.applyEcgInterpretation(result);
        }
      },
      error: () => {
        this.interpretingEcg = false;
      },
    });
  }

  private applyEcgInterpretation(result: EcgInterpretation): void {
    const patch: any = {};
    const filled: string[] = [];

    if (result.restingECG !== null) { patch.ecg_reposo = result.restingECG; filled.push('ecg_reposo'); }
    if (result.maxHR !== null) { patch.fc_maxima = result.maxHR; filled.push('fc_maxima'); }
    if (result.oldpeak !== null) { patch.depresion_st = result.oldpeak; filled.push('depresion_st'); }
    if (result.stSlope !== null) { patch.pendiente_st = result.stSlope; filled.push('pendiente_st'); }

    if (filled.length > 0) {
      this.form.patchValue(patch);
      this.autoFilledFields = filled;
      this.showAutoFillToast(filled);
    }
  }

  private async showAutoFillToast(fields: string[]): Promise<void> {
    const names = fields.map(f => this.fieldLabels[f] || f);
    const toast = await this.toastCtrl.create({
      message: `Datos auto-completados desde la imagen: ${names.join(', ')}`,
      duration: 5000,
      color: 'success',
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await toast.present();
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
