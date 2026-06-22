import { Component } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { DataService, PrediccionReport } from '../services/data.service';

@Component({
  selector: 'app-reportes',
  templateUrl: 'reportes.page.html',
  styleUrls: ['reportes.page.scss'],
})
export class ReportesPage implements ViewWillEnter {
  reportes: PrediccionReport[] = [];

  constructor(private dataService: DataService) {}

  ionViewWillEnter(): void {
    this.reportes = this.dataService.getPredicciones().reverse();
  }

  riskColor(level: string): string {
    if (level === 'Alto') return 'var(--ion-color-danger)';
    if (level === 'Moderado') return 'var(--ion-color-warning)';
    return 'var(--ion-color-success)';
  }
}
