import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PerfilPage } from './perfil.page';
import { PerfilRoutingModule } from './perfil-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, PerfilRoutingModule],
  declarations: [PerfilPage]
})
export class PerfilPageModule {}
