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

  exportCSV(): void {
    if (this.reportes.length === 0) return;

    const headers = [
      'ID',
      'Paciente',
      'Telefono',
      'Fecha',
      'Prediccion',
      'Label',
      'Probabilidad Riesgo (%)',
      'Probabilidad Sin Riesgo (%)',
      'Nivel de Riesgo',
      'Fuente',
    ];

    const rows = this.reportes.map((r) => [
      r.id,
      r.paciente,
      r.telefono ?? '',
      r.fecha,
      r.prediction === 1 ? 'Riesgo' : 'Sin Riesgo',
      r.label,
      r.probability_risk,
      r.probability_no_risk,
      r.risk_level,
      r.source === 'failed' ? 'Fallo ML' : r.source,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => {
              const val = String(cell);
              if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                return '"' + val.replace(/"/g, '""') + '"';
              }
              return val;
            })
            .join(','),
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fecha = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute('download', `reportes_cardio_${fecha}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportJSON(): void {
    if (this.reportes.length === 0) return;

    const data = this.reportes.map((r) => ({
      id: r.id,
      paciente: r.paciente,
      telefono: r.telefono ?? null,
      fecha: r.fecha,
      prediccion: r.prediction === 1 ? 'Riesgo' : 'Sin Riesgo',
      label: r.label,
      probabilidad_riesgo: r.probability_risk,
      probabilidad_sin_riesgo: r.probability_no_risk,
      nivel_riesgo: r.risk_level,
      fuente: r.source === 'failed' ? 'Fallo ML' : r.source,
    }));

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fecha = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute('download', `reportes_cardio_${fecha}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
