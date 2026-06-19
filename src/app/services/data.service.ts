import { Injectable } from '@angular/core';

export interface UserData {
  email: string;
  password: string;
}

export interface HistoryRecord {
  id: number;
  fecha: string;
  tipo: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private userData: UserData | null = null;
  private history: HistoryRecord[] = [
    { id: 1, fecha: '2026-06-19', tipo: 'Evaluación', descripcion: 'Evaluación cardiovascular completa' },
    { id: 2, fecha: '2026-06-18', tipo: 'Login', descripcion: 'Inicio de sesión registrado' },
    { id: 3, fecha: '2026-06-15', tipo: 'Formulario', descripcion: 'Actualización de datos clínicos' },
  ];

  setUserData(data: UserData) {
    this.userData = data;
  }

  getUserData(): UserData | null {
    return this.userData;
  }

  getHistory(): HistoryRecord[] {
    return this.history;
  }

  addHistoryRecord(record: HistoryRecord) {
    this.history.unshift(record);
  }
}
