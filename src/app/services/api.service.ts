import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, of } from 'rxjs';
import { ConfigService } from './config.service';

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
  constructor(
    private http: HttpClient,
    private config: ConfigService,
  ) {}

  predict(features: HeartFeatures): Observable<PredictionResult> {
    const urls = this.config.getAllUrls();
    return this.tryPredict(urls, 0, features);
  }

  private tryPredict(urls: string[], index: number, features: HeartFeatures): Observable<PredictionResult> {
    if (index >= urls.length) {
      return of(null as unknown as PredictionResult);
    }
    const url = urls[index];
    return this.http.post<PredictionResult>(`${url}/predict`, features).pipe(
      timeout(5000),
      catchError(() => {
        if (index < urls.length - 1) {
          const next = urls[index + 1];
          const idx = urls.findIndex(u => u === next);
          return this.tryPredict(urls, idx, features);
        }
        return of(null as unknown as PredictionResult);
      }),
    );
  }

  healthCheck(): Observable<any> {
    const urls = this.config.getAllUrls();
    return this.tryHealth(urls, 0);
  }

  private tryHealth(urls: string[], index: number): Observable<any> {
    if (index >= urls.length) {
      return of(null);
    }
    return this.http.get(`${urls[index]}/`).pipe(
      timeout(3000),
      catchError(() => {
        if (index < urls.length - 1) {
          return this.tryHealth(urls, index + 1);
        }
        return of(null);
      }),
    );
  }
}
