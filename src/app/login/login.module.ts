import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginPage } from './login.page';
import { LoginRoutingModule } from './login-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, LoginRoutingModule],
  declarations: [LoginPage]
})
export class LoginPageModule {}
