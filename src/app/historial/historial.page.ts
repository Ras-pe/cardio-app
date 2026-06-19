import { Component } from '@angular/core';
import { DataService, HistoryRecord } from '../services/data.service';

@Component({
  selector: 'app-historial',
  templateUrl: 'historial.page.html',
  styleUrls: ['historial.page.scss'],
})
export class HistorialPage {
  records: HistoryRecord[] = this.dataService.getHistory();

  constructor(private dataService: DataService) {}
}
