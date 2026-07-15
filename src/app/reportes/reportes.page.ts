import { Component } from '@angular/core';
import { ViewWillEnter, ToastController } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { DataService, PrediccionReport } from '../services/data.service';

@Component({
  selector: 'app-reportes',
  templateUrl: 'reportes.page.html',
  styleUrls: ['reportes.page.scss'],
})
export class ReportesPage implements ViewWillEnter {
  reportes: PrediccionReport[] = [];

  constructor(
    private dataService: DataService,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter(): void {
    this.reportes = this.dataService.getPredicciones().reverse();
  }

  riskColor(level: string): string {
    if (level === 'Alto') return 'var(--ion-color-danger)';
    if (level === 'Moderado') return 'var(--ion-color-warning)';
    return 'var(--ion-color-success)';
  }

  private getFechaArchivo(): string {
    return new Date().toISOString().split('T')[0];
  }

  async descargarCSV(): Promise<void> {
    try {
      const contenido = this.dataService.exportarCSV(this.reportes);
      const nombre = `reportes_${this.getFechaArchivo()}.csv`;
      await Filesystem.writeFile({
        path: `CardioApp/${nombre}`,
        data: contenido,
        directory: Directory.ExternalStorage,
        encoding: Encoding.UTF8,
      });
      this.mostrarToast(`Archivo guardado en CardioApp/${nombre}`, 'success');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      this.mostrarToast('Error al exportar CSV', 'danger');
    }
  }

  async descargarJSON(): Promise<void> {
    try {
      const contenido = this.dataService.exportarJSON(this.reportes);
      const nombre = `reportes_${this.getFechaArchivo()}.json`;
      await Filesystem.writeFile({
        path: `CardioApp/${nombre}`,
        data: contenido,
        directory: Directory.ExternalStorage,
        encoding: Encoding.UTF8,
      });
      this.mostrarToast(`Archivo guardado en CardioApp/${nombre}`, 'success');
    } catch (error) {
      console.error('Error al exportar JSON:', error);
      this.mostrarToast('Error al exportar JSON', 'danger');
    }
  }

  private async mostrarToast(mensaje: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'bottom',
    });
    toast.present();
  }
}
