import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormularioPage } from './formulario.page';
import { FormularioRoutingModule } from './formulario-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, FormularioRoutingModule],
  declarations: [FormularioPage]
})
export class FormularioPageModule {}
