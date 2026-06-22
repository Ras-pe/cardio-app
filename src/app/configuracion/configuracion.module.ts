import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ConfiguracionPage } from './configuracion.page';
import { ConfiguracionRoutingModule } from './configuracion-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, ConfiguracionRoutingModule],
  declarations: [ConfiguracionPage]
})
export class ConfiguracionPageModule {}
