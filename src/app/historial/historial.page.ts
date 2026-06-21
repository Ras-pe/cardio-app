import { Component } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { DataService, HistoryRecord } from '../services/data.service';

@Component({
  selector: 'app-historial',
  templateUrl: 'historial.page.html',
  styleUrls: ['historial.page.scss'],
})
export class HistorialPage implements ViewWillEnter {
  records: HistoryRecord[] = [];

  constructor(private dataService: DataService) {}

  ionViewWillEnter(): void {
    this.records = this.dataService.getHistory();
  }
}
