import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-formulario',
  templateUrl: 'formulario.page.html',
  styleUrls: ['formulario.page.scss'],
})
export class FormularioPage implements OnInit, OnDestroy {
  form!: FormGroup;
  submitting = false;
  private destroy$ = new Subject<void>();

  sexos = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
  ];

  tipoDolor = [
    { value: 'tipica', label: 'Angina típica' },
    { value: 'atipica', label: 'Angina atípica' },
    { value: 'no_anginal', label: 'Dolor no anginal' },
    { value: 'asintomatico', label: 'Asintomático' },
  ];

  nivelesActividad = [
    { value: 'sedentario', label: 'Sedentario' },
    { value: 'ligero', label: 'Ligero' },
    { value: 'moderado', label: 'Moderado' },
    { value: 'activo', label: 'Activo' },
    { value: 'intenso', label: 'Muy intenso' },
  ];

  nivelesEstres = [
    { value: 'bajo', label: 'Bajo' },
    { value: 'moderado', label: 'Moderado' },
    { value: 'alto', label: 'Alto' },
    { value: 'muy_alto', label: 'Muy alto' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    private dataService: DataService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      sexo: ['', Validators.required],
      presion_arterial: ['', Validators.required],
      colesterol: ['', Validators.required],
      fc_maxima: ['', Validators.required],
      tipo_dolor_pecho: ['', Validators.required],

      peso: ['', Validators.required],
      estatura: ['', Validators.required],
      imc: [{ value: '', disabled: true }],
      circunferencia_cintura: [''],
      relacion_cintura_estatura: [{ value: '', disabled: true }],

      diabetes: [false],
      hipertension: [false],
      antecedentes_familiares: [false],
      enfermedad_renal: [false],
      medicamentos_actuales: [''],

      tabaquismo: [false],
      consumo_alcohol: [''],
      actividad_fisica: [''],
      horas_sueno: ['', [Validators.min(0), Validators.max(24)]],
      nivel_estres: [''],

      glucosa_sangre: [''],
      trigliceridos: [''],
      hdl: [''],
      ldl: [''],
      saturacion_oxigeno: ['', [Validators.min(0), Validators.max(100)]],

      frecuencia_respiratoria: [''],
      temperatura_corporal: [''],
      presion_sistolica: [''],
      presion_diastolica: [''],
    });

    this.form.get('peso')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateIMC());
    this.form.get('estatura')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateIMC());

    this.form.get('circunferencia_cintura')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateRelacionCintura());
    this.form.get('estatura')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateRelacionCintura());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateIMC() {
    const peso = this.form.get('peso')?.value;
    const estatura = this.form.get('estatura')?.value;
    if (peso && estatura && estatura > 0) {
      const imc = peso / ((estatura / 100) * (estatura / 100));
      this.form.get('imc')?.setValue(imc.toFixed(1));
    }
  }

  private updateRelacionCintura() {
    const cintura = this.form.get('circunferencia_cintura')?.value;
    const estatura = this.form.get('estatura')?.value;
    if (cintura && estatura && estatura > 0) {
      const relacion = cintura / estatura;
      this.form.get('relacion_cintura_estatura')?.setValue(relacion.toFixed(2));
    }
  }

  async onSubmit() {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;

    const v = this.form.getRawValue();

    this.dataService.addEvaluacion({
      edad: Number(v.edad),
      sexo: v.sexo,
      presion_arterial: Number(v.presion_arterial),
      colesterol: Number(v.colesterol),
      fc_maxima: Number(v.fc_maxima),
      tipo_dolor_pecho: v.tipo_dolor_pecho,
      peso: Number(v.peso),
      estatura: Number(v.estatura),
      imc: v.imc ? Number(v.imc) : 0,
      circunferencia_cintura: v.circunferencia_cintura ? Number(v.circunferencia_cintura) : null,
      relacion_cintura_estatura: v.relacion_cintura_estatura ? Number(v.relacion_cintura_estatura) : null,
      diabetes: v.diabetes,
      hipertension: v.hipertension,
      antecedentes_familiares: v.antecedentes_familiares,
      enfermedad_renal: v.enfermedad_renal,
      medicamentos_actuales: v.medicamentos_actuales || '',
      tabaquismo: v.tabaquismo,
      consumo_alcohol: v.consumo_alcohol || '',
      actividad_fisica: v.actividad_fisica || '',
      horas_sueno: v.horas_sueno ? Number(v.horas_sueno) : null,
      nivel_estres: v.nivel_estres || '',
      glucosa_sangre: v.glucosa_sangre ? Number(v.glucosa_sangre) : null,
      trigliceridos: v.trigliceridos ? Number(v.trigliceridos) : null,
      hdl: v.hdl ? Number(v.hdl) : null,
      ldl: v.ldl ? Number(v.ldl) : null,
      saturacion_oxigeno: v.saturacion_oxigeno ? Number(v.saturacion_oxigeno) : null,
      frecuencia_respiratoria: v.frecuencia_respiratoria ? Number(v.frecuencia_respiratoria) : null,
      temperatura_corporal: v.temperatura_corporal ? Number(v.temperatura_corporal) : null,
      presion_sistolica: v.presion_sistolica ? Number(v.presion_sistolica) : null,
      presion_diastolica: v.presion_diastolica ? Number(v.presion_diastolica) : null,
    });

    const toast = await this.toastCtrl.create({
      message: 'Evaluación guardada correctamente',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();

    this.submitting = false;
    this.router.navigate(['/home']);
  }
}
