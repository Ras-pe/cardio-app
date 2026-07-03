import { Component } from '@angular/core';
import { ViewWillEnter, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter {
  userEmail = '';
  testing = false;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private config: ConfigService,
    private toastCtrl: ToastController,
  ) {}

  ionViewWillEnter(): void {
    this.userEmail = this.auth.getUserEmail();
  }

  async testConnection() {
    this.testing = true;
    this.api.healthCheck().subscribe({
      next: async (res) => {
        this.testing = false;
        const server = this.config.getActiveUrl();
        if (res) {
          const toast = await this.toastCtrl.create({
            message: `Conexión exitosa con ${server}`,
            duration: 3000,
            color: 'success',
            position: 'bottom',
          });
          await toast.present();
        } else {
          const toast = await this.toastCtrl.create({
            message: `Sin conexión con ${server}`,
            duration: 3000,
            color: 'danger',
            position: 'bottom',
          });
          await toast.present();
        }
      },
      error: async () => {
        this.testing = false;
        const server = this.config.getActiveUrl();
        const toast = await this.toastCtrl.create({
          message: `Error de conexión con ${server}`,
          duration: 3000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }

  logout() {
    this.auth.logout();
  }
}
