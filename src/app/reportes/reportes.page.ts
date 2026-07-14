import { Component } from '@angular/core';
import { ViewWillEnter, ToastController } from '@ionic/angular';
import { DataService, PrediccionReport } from '../services/data.service';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-reportes',
  templateUrl: 'reportes.page.html',
  styleUrls: ['reportes.page.scss'],
})
export class ReportesPage implements ViewWillEnter {
  reportes: PrediccionReport[] = [];

  constructor(
    private dataService: DataService,
    private toastCtrl: ToastController,
  ) {}

  ionViewWillEnter(): void {
    this.reportes = this.dataService.getPredicciones().reverse();
  }

  riskColor(level: string): string {
    if (level === 'Alto') return 'var(--ion-color-danger)';
    if (level === 'Moderado') return 'var(--ion-color-warning)';
    return 'var(--ion-color-success)';
  }

  async exportCSV(): Promise<void> {
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

    const fecha = new Date().toISOString().slice(0, 10);
    const filename = `reportes_cardio_${fecha}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    if (Capacitor.isNativePlatform()) {
      await this.openFileInBrowser(csvContent, filename, 'CSV');
    } else {
      this.downloadOnDesktop(blob, filename);
      await this.showToast('CSV exportado correctamente');
    }
  }

  async exportJSON(): Promise<void> {
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
    const fecha = new Date().toISOString().slice(0, 10);
    const filename = `reportes_cardio_${fecha}.json`;
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

    if (Capacitor.isNativePlatform()) {
      await this.openFileInBrowser(jsonContent, filename, 'JSON');
    } else {
      this.downloadOnDesktop(blob, filename);
      await this.showToast('JSON exportado correctamente');
    }
  }

  private async openFileInBrowser(content: string, filename: string, format: string): Promise<void> {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Browser.open({ url: result.uri });
      await this.showToast(`Abriendo ${format} en el navegador`);
    } catch {
      await this.showToast(`No se pudo abrir el archivo ${format}`, 'danger');
    }
  }

  private downloadOnDesktop(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private async showToast(message: string, color: string = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
