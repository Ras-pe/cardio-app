import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HeartFeatures {
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
}

export interface PredictionResult {
  prediction: number;
  label: string;
  probability_no_risk: number;
  probability_risk: number;
  risk_level: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  predict(features: HeartFeatures): Observable<PredictionResult> {
    return this.http.post<PredictionResult>(`${this.apiUrl}/predict`, features).pipe(
      timeout(5000),
      catchError(() => of(null as unknown as PredictionResult))
    );
  }

  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`).pipe(
      timeout(3000),
      catchError(() => of(null))
    );
  }
}
