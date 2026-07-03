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

export interface RecommendationRequest {
  riskLevel: string;
  riskScore: number;
  detectedRhythm: string;
  troponinI: number;
  confidence: number;
}

export interface RecommendationResult {
  recommendation: string;
  urgency: string;
  clinicalBasis: string;
  keyAction: string;
  sourceIsVault: boolean;
}

export interface EcgInterpretation {
  age: number | null;
  sex: string | null;
  chestPainType: string | null;
  restingBP: number | null;
  cholesterol: number | null;
  fastingBS: number | null;
  restingECG: string | null;
  maxHR: number | null;
  exerciseAngina: string | null;
  oldpeak: number | null;
  stSlope: string | null;
  rhythm: string | null;
  confidence: number | null;
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

  getRecommendation(body: RecommendationRequest): Observable<RecommendationResult> {
    const urls = this.config.getAllUrls();
    return this.tryRecommendation(urls, 0, body);
  }

  private tryRecommendation(urls: string[], index: number, body: RecommendationRequest): Observable<RecommendationResult> {
    if (index >= urls.length) {
      return of(null as unknown as RecommendationResult);
    }
    return this.http.post<RecommendationResult>(`${urls[index]}/api/recommendation`, body).pipe(
      timeout(30000),
      catchError(() => {
        if (index < urls.length - 1) {
          return this.tryRecommendation(urls, index + 1, body);
        }
        return of(null as unknown as RecommendationResult);
      }),
    );
  }

  interpretEcg(imageBase64: string): Observable<EcgInterpretation> {
    const urls = this.config.getAllUrls();
    return this.tryInterpretEcg(urls, 0, imageBase64);
  }

  private tryInterpretEcg(urls: string[], index: number, imageBase64: string): Observable<EcgInterpretation> {
    if (index >= urls.length) {
      return of({} as EcgInterpretation);
    }
    return this.http.post<EcgInterpretation>(`${urls[index]}/interpret-ecg`, { image: imageBase64 }).pipe(
      timeout(120000),
      catchError(() => {
        if (index < urls.length - 1) {
          return this.tryInterpretEcg(urls, index + 1, imageBase64);
        }
        return of({} as EcgInterpretation);
      }),
    );
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
