import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GestionUsuariosPage } from './gestion-usuarios.page';
import { GestionUsuariosRoutingModule } from './gestion-usuarios-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, GestionUsuariosRoutingModule],
  declarations: [GestionUsuariosPage]
})
export class GestionUsuariosPageModule {}
