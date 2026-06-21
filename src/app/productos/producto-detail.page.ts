import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Producto } from '../models/producto.model';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-producto-detail',
  templateUrl: 'producto-detail.page.html',
  styleUrls: ['producto-detail.page.scss'],
})
export class ProductoDetailPage implements OnInit {
  form!: FormGroup;
  isEdit = false;
  productoId: number | null = null;
  loading = false;
  saving = false;
  pageTitle = 'Nuevo Producto';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.productoId = Number(id);
      this.pageTitle = 'Editar Producto';
      this.loadProducto(this.productoId);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
    });
  }

  private loadProducto(id: number): void {
    this.loading = true;
    this.productoService.getById(id).subscribe({
      next: (producto) => {
        if (producto) {
          this.form.patchValue({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
          });
        } else {
          this.router.navigate(['/productos']);
        }
        this.loading = false;
      },
      error: async () => {
        this.loading = false;
        const toast = await this.toastCtrl.create({
          message: 'Error al cargar el producto.',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
        });
        toast.present();
        this.router.navigate(['/productos']);
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    const data = this.form.value;

    const operation$ = this.isEdit && this.productoId
      ? this.productoService.update(this.productoId, data)
      : this.productoService.create(data);

    operation$.subscribe({
      next: async (result) => {
        const message = this.isEdit
          ? 'Producto actualizado correctamente.'
          : 'Producto creado correctamente.';

        const toast = await this.toastCtrl.create({
          message,
          duration: 2000,
          color: 'success',
          position: 'bottom',
        });
        toast.present();
        this.saving = false;
        this.router.navigate(['/productos']);
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Error al guardar el producto.',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
        });
        toast.present();
        this.saving = false;
      },
    });
  }

  async onDelete(): Promise<void> {
    if (!this.productoId) return;

    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteProducto(),
        },
      ],
    });
    await alert.present();
  }

  private deleteProducto(): void {
    if (!this.productoId) return;

    this.productoService.delete(this.productoId).subscribe({
      next: async (success) => {
        if (success) {
          const toast = await this.toastCtrl.create({
            message: 'Producto eliminado correctamente.',
            duration: 2000,
            color: 'success',
            position: 'bottom',
          });
          toast.present();
          this.router.navigate(['/productos']);
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

  get nombreControl() { return this.form.get('nombre'); }
  get descripcionControl() { return this.form.get('descripcion'); }
  get precioControl() { return this.form.get('precio'); }
  get stockControl() { return this.form.get('stock'); }
}
