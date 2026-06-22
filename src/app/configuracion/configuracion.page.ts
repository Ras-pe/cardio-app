import { Component } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { ConfigService, ServerConfig } from '../services/config.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: 'configuracion.page.html',
  styleUrls: ['configuracion.page.scss'],
})
export class ConfiguracionPage implements ViewWillEnter {
  servers: (ServerConfig & { _testing?: boolean; _testMsg?: string; _testOk?: boolean })[] = [];

  showAddForm = false;
  editingId: number | null = null;
  formName = '';
  formIp = '';
  formPort: number | null = null;

  constructor(private config: ConfigService) {}

  ionViewWillEnter(): void {
    this.loadServers();
  }

  private loadServers(): void {
    this.servers = this.config.getServers().map(s => ({ ...s }));
  }

  activateServer(id: number): void {
    this.config.setActive(id);
    this.loadServers();
  }

  async testServer(server: any): Promise<void> {
    server._testing = true;
    server._testMsg = '';
    const ok = await this.config.testServer(server.ip, server.port);
    server._testing = false;
    server._testOk = ok;
    server._testMsg = ok ? 'Conexión exitosa' : 'Error de conexión';
  }

  editServer(server: ServerConfig): void {
    this.editingId = server.id;
    this.formName = server.name;
    this.formIp = server.ip;
    this.formPort = server.port;
    this.showAddForm = true;
  }

  deleteServer(server: ServerConfig): void {
    this.config.deleteServer(server.id);
    this.loadServers();
  }

  saveServer(): void {
    if (!this.formName || !this.formIp || !this.formPort) return;

    if (this.editingId) {
      this.config.updateServer(this.editingId, {
        name: this.formName,
        ip: this.formIp,
        port: this.formPort,
      });
    } else {
      this.config.addServer({
        name: this.formName,
        ip: this.formIp,
        port: this.formPort,
      });
    }
    this.cancelForm();
    this.loadServers();
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingId = null;
    this.formName = '';
    this.formIp = '';
    this.formPort = null;
  }
}
