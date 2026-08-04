export interface Marca {
  id_marca?: number;
  nombre_marca: string;
}

export interface Proveedor {
  id_proveedor?: number;
  nombre_pv: string;
  direccion_pv?: string;
  telefono_pv?: string;
}

export interface Producto {
  id_producto?: number;
  codigo: string;
  nombre_producto: string;
  id_marca_producto?: number | null;
  nombre_marca?: string; // viene del JOIN que ya hace el backend
  precio_compra?: number | null;
  precio_venta: number;
  existencia: number;
  stock_minimo: number;
  iva?: number | null;
  foto?: string | null;
  id_proveedor?: number | null;
}