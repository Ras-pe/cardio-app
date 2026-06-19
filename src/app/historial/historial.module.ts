import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HistorialPage } from './historial.page';
import { HistorialRoutingModule } from './historial-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, HistorialRoutingModule],
  declarations: [HistorialPage]
})
export class HistorialPageModule {}
