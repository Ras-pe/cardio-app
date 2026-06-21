import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductoDetailPage } from './producto-detail.page';
import { ProductoDetailRoutingModule } from './producto-detail-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, ProductoDetailRoutingModule],
  declarations: [ProductoDetailPage]
})
export class ProductoDetailPageModule {}
