import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterPage } from './register.page';
import { RegisterRoutingModule } from './register-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, RegisterRoutingModule],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}
