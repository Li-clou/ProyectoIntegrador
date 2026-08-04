export interface VentaResumen {
  id_venta: number;
  fecha_v: string;
  subtotal: number;
  iva_total: number;
  propina: number;
  descuento: number;
  total: number;
  metodo_pago: string;
  tipo_venta: string;
  numero_mesa?: number | null;
  id_usuario_v?: number;
  nombre_us?: string;
  ap_us?: string;
  total_articulos: number;
}