import { Injectable } from '@angular/core';

export interface HistoryRecord {
  id: number;
  fecha: string;
  tipo: string;
  descripcion: string;
  paciente?: string;
}

export interface Evaluacion {
  id: number;
  fecha: string;
  nombre_paciente: string;
  telefono_paciente: string;
  edad: number;
  sexo: string;
  presion_arterial: number;
  colesterol: number;
  fc_maxima: number;
  tipo_dolor_pecho: string;
  ayunas_glucosa_alta: boolean;
  ecg_reposo: string;
  angina_ejercicio: boolean;
  depresion_st: number;
  pendiente_st: string;
}

export interface PrediccionReport {
  id: number;
  evaluacionId: number;
  fecha: string;
  paciente: string;
  telefono?: string;
  prediction: number;
  label: string;
  probability_risk: number;
  probability_no_risk: number;
  risk_level: string;
  source: 'ML' | 'local';
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly HISTORY_KEY = 'cardio-history';
  private readonly EVAL_KEY = 'cardio-evaluaciones';
  private readonly PRED_KEY = 'cardio-predicciones';

  private history: HistoryRecord[] = [];
  private evaluaciones: Evaluacion[] = [];
  private predicciones: PrediccionReport[] = [];

  constructor() {
    this.loadHistory();
    this.loadEvaluaciones();
    this.loadPredicciones();
  }

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

  calculateRisk(ev: Evaluacion): number {
    let score = 0;

    if (ev.edad > 55) score += 15;
    else if (ev.edad > 45) score += 10;
    else if (ev.edad > 35) score += 5;

    if (ev.sexo === 'M') score += 5;

    if (ev.presion_arterial > 140) score += 15;
    else if (ev.presion_arterial > 130) score += 10;
    else if (ev.presion_arterial > 120) score += 5;

    if (ev.colesterol > 240) score += 15;
    else if (ev.colesterol > 200) score += 10;
    else if (ev.colesterol > 180) score += 5;

    if (ev.fc_maxima < 120) score += 10;
    else if (ev.fc_maxima < 150) score += 5;

    if (ev.ayunas_glucosa_alta) score += 10;
    if (ev.angina_ejercicio) score += 10;

    return Math.min(score, 100);
  }

  getRiskLevel(score: number): string {
    if (score >= 70) return 'Alto';
    if (score >= 40) return 'Moderado';
    if (score > 0) return 'Bajo';
    return 'Sin datos';
  }

  getRiskColor(score: number): string {
    if (score >= 70) return 'danger';
    if (score >= 40) return 'warning';
    if (score > 0) return 'success';
    return 'medium';
  }

  private loadPredicciones(): void {
    try {
      const raw = localStorage.getItem(this.PRED_KEY);
      if (raw) {
        this.predicciones = JSON.parse(raw);
      }
    } catch {
      this.predicciones = [];
    }
  }

  private savePredicciones(): void {
    localStorage.setItem(this.PRED_KEY, JSON.stringify(this.predicciones));
  }

  getPredicciones(): PrediccionReport[] {
    try {
      const raw = localStorage.getItem(this.PRED_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  addPrediccion(data: Omit<PrediccionReport, 'id'>): PrediccionReport {
    const nextId = this.predicciones.length > 0
      ? Math.max(...this.predicciones.map(p => p.id)) + 1
      : 1;
    const report: PrediccionReport = { ...data, id: nextId };
    this.predicciones.push(report);
    this.savePredicciones();
    return report;
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

    const pacienteInfo = data.nombre_paciente
      ? `Paciente: ${data.nombre_paciente}${data.telefono_paciente ? ` - Tel: ${data.telefono_paciente}` : ''}`
      : '';
    const nombrePaciente = data.nombre_paciente?.trim() || 'Paciente';
    this.addHistoryRecord({
      fecha: evaluacion.fecha,
      tipo: 'Evaluación',
      descripcion: `Evaluación cardiovascular #${nextId} - Riesgo calculado${pacienteInfo ? ` (${pacienteInfo})` : ''}`,
      paciente: nombrePaciente,
    });

    return evaluacion;
  }
}
