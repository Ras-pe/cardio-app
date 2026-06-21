import { Injectable } from '@angular/core';

export interface HistoryRecord {
  id: number;
  fecha: string;
  tipo: string;
  descripcion: string;
}

export interface Evaluacion {
  id: number;
  fecha: string;
  edad: number;
  sexo: string;
  presion_arterial: number;
  colesterol: number;
  fc_maxima: number;
  tipo_dolor_pecho: string;
  peso: number;
  estatura: number;
  imc: number;
  circunferencia_cintura: number | null;
  relacion_cintura_estatura: number | null;
  diabetes: boolean;
  hipertension: boolean;
  antecedentes_familiares: boolean;
  enfermedad_renal: boolean;
  medicamentos_actuales: string;
  tabaquismo: boolean;
  consumo_alcohol: string;
  actividad_fisica: string;
  horas_sueno: number | null;
  nivel_estres: string;
  glucosa_sangre: number | null;
  trigliceridos: number | null;
  hdl: number | null;
  ldl: number | null;
  saturacion_oxigeno: number | null;
  frecuencia_respiratoria: number | null;
  temperatura_corporal: number | null;
  presion_sistolica: number | null;
  presion_diastolica: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly HISTORY_KEY = 'cardio-history';
  private readonly EVAL_KEY = 'cardio-evaluaciones';

  private history: HistoryRecord[] = [];
  private evaluaciones: Evaluacion[] = [];

  constructor() {
    this.loadHistory();
    this.loadEvaluaciones();
  }

  // --- Historial ---
  private loadHistory(): void {
    try {
      const raw = localStorage.getItem(this.HISTORY_KEY);
      if (raw) {
        this.history = JSON.parse(raw);
      } else {
        this.seedHistory();
      }
    } catch {
      this.seedHistory();
    }
  }

  private saveHistory(): void {
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
  }

  private seedHistory(): void {
    this.history = [
      { id: 1, fecha: '2026-06-19', tipo: 'Evaluación', descripcion: 'Evaluación cardiovascular completa' },
      { id: 2, fecha: '2026-06-18', tipo: 'Login', descripcion: 'Inicio de sesión registrado' },
      { id: 3, fecha: '2026-06-15', tipo: 'Formulario', descripcion: 'Actualización de datos clínicos' },
    ];
    this.saveHistory();
  }

  getHistory(): HistoryRecord[] {
    return [...this.history];
  }

  addHistoryRecord(record: Omit<HistoryRecord, 'id'>): void {
    const nextId = this.history.length > 0 ? Math.max(...this.history.map(r => r.id)) + 1 : 1;
    this.history.unshift({ ...record, id: nextId });
    this.saveHistory();
  }

  // --- Evaluaciones ---
  private loadEvaluaciones(): void {
    try {
      const raw = localStorage.getItem(this.EVAL_KEY);
      if (raw) {
        this.evaluaciones = JSON.parse(raw);
      }
    } catch {
      this.evaluaciones = [];
    }
  }

  private saveEvaluaciones(): void {
    localStorage.setItem(this.EVAL_KEY, JSON.stringify(this.evaluaciones));
  }

  getEvaluaciones(): Evaluacion[] {
    return [...this.evaluaciones];
  }

  getUltimaEvaluacion(): Evaluacion | null {
    return this.evaluaciones.length > 0 ? this.evaluaciones[this.evaluaciones.length - 1] : null;
  }

  addEvaluacion(data: Omit<Evaluacion, 'id' | 'fecha'>): Evaluacion {
    const nextId = this.evaluaciones.length > 0
      ? Math.max(...this.evaluaciones.map(e => e.id)) + 1
      : 1;
    const evaluacion: Evaluacion = {
      ...data,
      id: nextId,
      fecha: new Date().toISOString().split('T')[0],
    };
    this.evaluaciones.push(evaluacion);
    this.saveEvaluaciones();

    this.addHistoryRecord({
      fecha: evaluacion.fecha,
      tipo: 'Evaluación',
      descripcion: `Evaluación cardiovascular #${nextId} - Riesgo calculado`,
    });

    return evaluacion;
  }
}
