import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { Producto } from '../models/producto.model';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-productos',
  templateUrl: 'productos.page.html',
  styleUrls: ['productos.page.scss'],
})
export class ProductosPage implements OnInit, OnDestroy {
  productos: Producto[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private productoService: ProductoService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.productoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.productos = items;
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-empty';
    if (stock <= 10) return 'stock-low';
    return 'stock-ok';
  }

  async confirmDelete(producto: Producto): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: `¿Estás seguro de eliminar <strong>${producto.nombre}</strong>? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteProducto(producto.id),
        },
      ],
    });
    await alert.present();
  }

  private async deleteProducto(id: number): Promise<void> {
    this.productoService.delete(id).subscribe({
      next: async (success) => {
        if (success) {
          const toast = await this.toastCtrl.create({
            message: 'Producto eliminado correctamente.',
            duration: 2000,
            color: 'success',
            position: 'bottom',
          });
          toast.present();
        }
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Error al eliminar el producto.',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
        });
        toast.present();
      },
    });
  }
}
