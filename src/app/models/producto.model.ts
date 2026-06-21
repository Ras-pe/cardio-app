export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}
