import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, of } from 'rxjs';
import { ConfigService } from './config.service';

export interface HeartFeaturesNew {
  age: number;
  sex: string;
  chestPainType: string;
  restingBP: number;
  cholesterol: number;
  fastingBS: number;
  restingECG: string;
  maxHR: number;
  exerciseAngina: string;
  oldpeak: number;
  stSlope: string;
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

  predict(features: HeartFeaturesNew): Observable<PredictionResult> {
    const urls = this.config.getAllUrls();
    return this.tryPredict(urls, 0, features);
  }

  private tryPredict(urls: string[], index: number, features: HeartFeaturesNew): Observable<PredictionResult> {
    if (index >= urls.length) {
      return of(null as unknown as PredictionResult);
    }
    const url = urls[index];
    return this.http.post<PredictionResult>(`${url}/predict`, features).pipe(
      timeout(5000),
      catchError(() => {
        if (index < urls.length - 1) {
          return this.tryPredict(urls, index + 1, features);
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
