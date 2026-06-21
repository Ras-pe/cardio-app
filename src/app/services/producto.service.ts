import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, tap } from 'rxjs';
import { Producto, ProductoCreate } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly STORAGE_KEY = 'cardio-productos';
  private productos$ = new BehaviorSubject<Producto[]>([]);
  private nextId = 1;

  constructor() {
    this.loadFromStorage();
  }

  getAll(): Observable<Producto[]> {
    return this.productos$.asObservable();
  }

  getById(id: number): Observable<Producto | undefined> {
    const found = this.productos$.value.find(p => p.id === id);
    return of(found).pipe(delay(200));
  }

  create(data: ProductoCreate): Observable<Producto> {
    const now = new Date().toISOString();
    const producto: Producto = {
      id: this.nextId++,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      precio: Number(data.precio.toFixed(2)),
      stock: Math.floor(data.stock),
      fechaCreacion: now,
      fechaActualizacion: now,
    };

    const current = this.productos$.value;
    const updated = [producto, ...current];
    this.productos$.next(updated);
    this.saveToStorage(updated);

    return of(producto).pipe(delay(300));
  }

  update(id: number, data: ProductoCreate): Observable<Producto | undefined> {
    const current = this.productos$.value;
    const index = current.findIndex(p => p.id === id);

    if (index === -1) {
      return of(undefined).pipe(delay(200));
    }

    const updated: Producto = {
      ...current[index],
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      precio: Number(data.precio.toFixed(2)),
      stock: Math.floor(data.stock),
      fechaActualizacion: new Date().toISOString(),
    };

    const newList = [...current];
    newList[index] = updated;
    this.productos$.next(newList);
    this.saveToStorage(newList);

    return of(updated).pipe(delay(300));
  }

  delete(id: number): Observable<boolean> {
    const current = this.productos$.value;
    const filtered = current.filter(p => p.id !== id);

    if (filtered.length === current.length) {
      return of(false).pipe(delay(200));
    }

    this.productos$.next(filtered);
    this.saveToStorage(filtered);

    return of(true).pipe(delay(200));
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const items: Producto[] = JSON.parse(raw);
        this.productos$.next(items);
        if (items.length > 0) {
          this.nextId = Math.max(...items.map(p => p.id)) + 1;
        }
      } else {
        this.seedDemoData();
      }
    } catch {
      this.seedDemoData();
    }
  }

  private saveToStorage(items: Producto[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  private seedDemoData(): void {
    const now = new Date();
    const demos: Producto[] = [
      {
        id: 1,
        nombre: 'Monitor de Presión Arterial',
        descripcion: 'Monitor digital de presión arterial con pantalla LCD y cuff para brazo.',
        precio: 1299.99,
        stock: 25,
        fechaCreacion: new Date(now.getTime() - 7 * 86400000).toISOString(),
        fechaActualizacion: new Date(now.getTime() - 7 * 86400000).toISOString(),
      },
      {
        id: 2,
        nombre: 'Oxímetro de Pulso',
        descripcion: 'Oxímetro digital portátil para medir saturación de oxígeno y frecuencia cardíaca.',
        precio: 459.00,
        stock: 50,
        fechaCreacion: new Date(now.getTime() - 3 * 86400000).toISOString(),
        fechaActualizacion: new Date(now.getTime() - 3 * 86400000).toISOString(),
      },
      {
        id: 3,
        nombre: 'Balanza Digital Corporal',
        descripcion: 'Balanza de precisión con medición de peso corporal y composition analysis.',
        precio: 899.50,
        stock: 15,
        fechaCreacion: new Date(now.getTime() - 1 * 86400000).toISOString(),
        fechaActualizacion: new Date(now.getTime() - 1 * 86400000).toISOString(),
      },
    ];
    this.nextId = demos.length + 1;
    this.productos$.next(demos);
    this.saveToStorage(demos);
  }
}
