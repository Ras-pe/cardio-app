import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-formulario',
  templateUrl: 'formulario.page.html',
  styleUrls: ['formulario.page.scss'],
})
export class FormularioPage implements OnInit {
  form: FormGroup;

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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Variables actuales
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      sexo: ['', Validators.required],
      presion_arterial: ['', Validators.required],
      colesterol: ['', Validators.required],
      fc_maxima: ['', Validators.required],
      tipo_dolor_pecho: ['', Validators.required],

      // Datos antropométricos
      peso: ['', Validators.required],
      estatura: ['', Validators.required],
      imc: [{ value: '', disabled: true }],
      circunferencia_cintura: [''],
      relacion_cintura_estatura: [{ value: '', disabled: true }],

      // Antecedentes médicos
      diabetes: [false],
      hipertension: [false],
      antecedentes_familiares: [false],
      enfermedad_renal: [false],
      medicamentos_actuales: [''],

      // Hábitos de vida
      tabaquismo: [false],
      consumo_alcohol: [''],
      actividad_fisica: [''],
      horas_sueno: ['', [Validators.min(0), Validators.max(24)]],
      nivel_estres: [''],

      // Estudios clínicos
      glucosa_sangre: [''],
      trigliceridos: [''],
      hdl: [''],
      ldl: [''],
      saturacion_oxigeno: ['', [Validators.min(0), Validators.max(100)]],

      // Signos vitales
      frecuencia_respiratoria: [''],
      temperatura_corporal: [''],
      presion_sistolica: [''],
      presion_diastolica: [''],
    });
  }

  ngOnInit() {
    this.calcularIMC();
    this.calcularRelacionCintura();
  }

  calcularIMC() {
    this.form.get('peso')?.valueChanges.subscribe(() => this.updateIMC());
    this.form.get('estatura')?.valueChanges.subscribe(() => this.updateIMC());
  }

  updateIMC() {
    const peso = this.form.get('peso')?.value;
    const estatura = this.form.get('estatura')?.value;
    if (peso && estatura && estatura > 0) {
      const imc = peso / ((estatura / 100) * (estatura / 100));
      this.form.get('imc')?.setValue(imc.toFixed(1));
    }
  }

  calcularRelacionCintura() {
    this.form.get('circunferencia_cintura')?.valueChanges.subscribe(() => this.updateRelacionCintura());
    this.form.get('estatura')?.valueChanges.subscribe(() => this.updateRelacionCintura());
  }

  updateRelacionCintura() {
    const cintura = this.form.get('circunferencia_cintura')?.value;
    const estatura = this.form.get('estatura')?.value;
    if (cintura && estatura && estatura > 0) {
      const relacion = cintura / estatura;
      this.form.get('relacion_cintura_estatura')?.setValue(relacion.toFixed(2));
    }
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Formulario enviado:', this.form.value);
    }
  }
}
