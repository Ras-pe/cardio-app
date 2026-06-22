import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReportesPage } from './reportes.page';
import { ReportesRoutingModule } from './reportes-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, ReportesRoutingModule],
  declarations: [ReportesPage]
})
export class ReportesPageModule {}
