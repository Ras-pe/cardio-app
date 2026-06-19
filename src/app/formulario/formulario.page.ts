import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-formulario',
  templateUrl: 'formulario.page.html',
  styleUrls: ['formulario.page.scss'],
})
export class FormularioPage implements OnInit {
  form: FormGroup;
  mostrarConfirmacion = false;

  confirmacionSections = [
    {
      title: 'Variables Actuales',
      icon: 'pulse-outline',
      color: 'primary',
      fields: ['edad', 'sexo', 'presion_arterial', 'colesterol', 'fc_maxima', 'tipo_dolor_pecho'],
    },
    {
      title: 'Datos Antropométricos',
      icon: 'body-outline',
      color: 'secondary',
      fields: ['peso', 'estatura', 'imc', 'circunferencia_cintura', 'relacion_cintura_estatura'],
    },
    {
      title: 'Antecedentes Médicos',
      icon: 'medkit-outline',
      color: 'tertiary',
      fields: ['diabetes', 'hipertension', 'antecedentes_familiares', 'enfermedad_renal', 'medicamentos_actuales'],
    },
    {
      title: 'Hábitos de Vida',
      icon: 'leaf-outline',
      color: 'success',
      fields: ['tabaquismo', 'consumo_alcohol', 'actividad_fisica', 'horas_sueno', 'nivel_estres'],
    },
    {
      title: 'Estudios Clínicos',
      icon: 'flask-outline',
      color: 'danger',
      fields: ['glucosa_sangre', 'trigliceridos', 'hdl', 'ldl', 'saturacion_oxigeno'],
    },
    {
      title: 'Signos Vitales',
      icon: 'fitness-outline',
      color: 'primary',
      fields: ['frecuencia_respiratoria', 'temperatura_corporal', 'presion_sistolica', 'presion_diastolica'],
    },
  ];

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
    if (this.form.invalid) return;

    if (!this.mostrarConfirmacion) {
      this.mostrarConfirmacion = true;
      return;
    }

    console.log('Formulario enviado:', this.form.value);
    this.mostrarConfirmacion = false;
  }

  volverAlFormulario() {
    this.mostrarConfirmacion = false;
  }

  getLabel(prop: string): string {
    const labels: Record<string, string> = {
      edad: 'Edad',
      sexo: 'Sexo',
      presion_arterial: 'Presión Arterial',
      colesterol: 'Colesterol',
      fc_maxima: 'Frecuencia Cardíaca Máxima',
      tipo_dolor_pecho: 'Tipo de Dolor en el Pecho',
      peso: 'Peso',
      estatura: 'Estatura',
      imc: 'IMC',
      circunferencia_cintura: 'Circunferencia de Cintura',
      relacion_cintura_estatura: 'Relación Cintura-Estatura',
      diabetes: 'Diabetes',
      hipertension: 'Hipertensión',
      antecedentes_familiares: 'Antecedentes familiares',
      enfermedad_renal: 'Enfermedad renal',
      medicamentos_actuales: 'Medicamentos actuales',
      tabaquismo: 'Tabaquismo',
      consumo_alcohol: 'Consumo de alcohol',
      actividad_fisica: 'Actividad física',
      horas_sueno: 'Horas de sueño',
      nivel_estres: 'Nivel de estrés',
      glucosa_sangre: 'Glucosa en sangre',
      trigliceridos: 'Triglicéridos',
      hdl: 'HDL',
      ldl: 'LDL',
      saturacion_oxigeno: 'Saturación de Oxígeno',
      frecuencia_respiratoria: 'Frecuencia Respiratoria',
      temperatura_corporal: 'Temperatura Corporal',
      presion_sistolica: 'Presión Sistólica',
      presion_diastolica: 'Presión Diastólica',
    };
    return labels[prop] || prop;
  }

  formatValue(value: any, prop: string): string {
    if (value === '' || value === null || value === undefined) return '—';

    const selectLabels: Record<string, Record<string, string>> = {
      sexo: { masculino: 'Masculino', femenino: 'Femenino' },
      tipo_dolor_pecho: { tipica: 'Angina típica', atipica: 'Angina atípica', no_anginal: 'Dolor no anginal', asintomatico: 'Asintomático' },
      consumo_alcohol: { nunca: 'Nunca', ocasional: 'Ocasional', moderado: 'Moderado', frecuente: 'Frecuente' },
      actividad_fisica: { sedentario: 'Sedentario', ligero: 'Ligero', moderado: 'Moderado', activo: 'Activo', intenso: 'Muy intenso' },
      nivel_estres: { bajo: 'Bajo', moderado: 'Moderado', alto: 'Alto', muy_alto: 'Muy alto' },
    };

    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (selectLabels[prop]?.[value]) return selectLabels[prop][value];
    return String(value);
  }
}
