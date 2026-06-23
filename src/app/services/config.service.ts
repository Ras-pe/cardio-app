import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, timeout } from 'rxjs';

export interface ServerConfig {
  id: number;
  name: string;
  ip: string;
  port: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly STORAGE_KEY = 'cardio-servers';
  private servers: ServerConfig[] = [];

  constructor(private http: HttpClient) {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        this.servers = JSON.parse(raw);
      } else {
        this.seed();
      }
    } catch {
      this.seed();
    }
  }

  private save(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.servers));
  }

  private seed(): void {
    this.servers = [
      { id: 1, name: 'Servidor principal', ip: 'localhost', port: 8000, active: true },
      { id: 2, name: 'Servidor secundario', ip: '192.168.1.100', port: 8000, active: false },
    ];
    this.save();
  }

  getServers(): ServerConfig[] {
    return [...this.servers];
  }

  getActiveServer(): ServerConfig | undefined {
    return this.servers.find(s => s.active);
  }

  private buildUrl(ip: string, port: number): string {
    return ip.includes('://') ? ip : `http://${ip}:${port}`;
  }

  getActiveUrl(): string {
    const active = this.getActiveServer();
    return active ? this.buildUrl(active.ip, active.port) : 'http://localhost:8000';
  }

  getAllUrls(): string[] {
    return this.servers.map(s => this.buildUrl(s.ip, s.port));
  }

  setActive(id: number): void {
    this.servers.forEach(s => s.active = s.id === id);
    this.save();
  }

  addServer(data: Omit<ServerConfig, 'id' | 'active'>): ServerConfig {
    const nextId = this.servers.length > 0 ? Math.max(...this.servers.map(s => s.id)) + 1 : 1;
    const server: ServerConfig = { ...data, id: nextId, active: false };
    this.servers.push(server);
    this.save();
    return server;
  }

  updateServer(id: number, data: Partial<Omit<ServerConfig, 'id'>>): void {
    const idx = this.servers.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.servers[idx] = { ...this.servers[idx], ...data };
      this.save();
    }
  }

  deleteServer(id: number): void {
    const server = this.servers.find(s => s.id === id);
    if (server?.active) {
      const remaining = this.servers.filter(s => s.id !== id);
      if (remaining.length > 0) remaining[0].active = true;
    }
    this.servers = this.servers.filter(s => s.id !== id);
    this.save();
  }

  async testServer(ip: string, port: number): Promise<boolean> {
    try {
      const url = ip.includes('://') ? ip : `http://${ip}:${port}`;
      const res = await lastValueFrom(
        this.http.get(url + '/').pipe(timeout(3000))
      );
      return res !== null;
    } catch {
      return false;
    }
  }
}
