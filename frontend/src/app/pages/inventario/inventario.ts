import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { InventarioService, Producto, Proveedor } from '../../services/inventario.service';

@Component({ selector: 'app-inventario', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './inventario.html' })
export class InventarioComponent implements OnInit {
  productos: Producto[] = []; proveedores: Proveedor[] = []; buscar = ''; error = '';
  producto: Producto = this.nuevoProducto(); proveedor: Proveedor = this.nuevoProveedor();
  editandoProducto = false; editandoProveedor = false;
  constructor(private api: InventarioService) {}
  ngOnInit() { this.cargar(); }
  nuevoProducto(): Producto { return { codigo: '', nombre_producto: '', precio_compra: 0, precio_venta: 0, existencia: 0, stock_minimo: 10, iva: 0, id_proveedor: null }; }
  nuevoProveedor(): Proveedor { return { nombre_pv: '', direccion_pv: '', telefono_pv: '' }; }
  cargar() { this.api.productos(this.buscar).subscribe({ next: x => this.productos = x, error: e => this.error = e.error?.error || 'Error al cargar productos' }); this.api.proveedores().subscribe(x => this.proveedores = x); }
  editarProducto(p: Producto) { this.producto = { ...p }; this.editandoProducto = true; }
  guardarProducto() {
    if (!this.producto.codigo || !this.producto.nombre_producto || this.producto.precio_venta <= 0 || !this.producto.id_proveedor) { this.error = 'Código, nombre, precio y proveedor son obligatorios'; return; }
    const peticion = this.editandoProducto && this.producto.id_producto ? this.api.actualizarProducto(this.producto.id_producto, this.producto) : this.api.crearProducto(this.producto);
    peticion.subscribe({ next: () => { this.producto = this.nuevoProducto(); this.editandoProducto = false; this.error = ''; this.cargar(); }, error: e => this.error = e.error?.error || 'No se pudo guardar' });
  }
  borrarProducto(p: Producto) { Swal.fire({ title: `¿Eliminar ${p.nombre_producto}?`, showCancelButton: true, icon: 'warning' }).then(r => { if (r.isConfirmed && p.id_producto) this.api.eliminarProducto(p.id_producto).subscribe({ next: () => this.cargar(), error: e => Swal.fire('Error', e.error?.error || '', 'error') }); }); }
  editarProveedor(p: Proveedor) { this.proveedor = { ...p }; this.editandoProveedor = true; }
  guardarProveedor() { if (!this.proveedor.nombre_pv) return; const q = this.editandoProveedor && this.proveedor.id_proveedor ? this.api.actualizarProveedor(this.proveedor.id_proveedor, this.proveedor) : this.api.crearProveedor(this.proveedor); q.subscribe({ next: () => { this.proveedor = this.nuevoProveedor(); this.editandoProveedor = false; this.cargar(); }, error: e => this.error = e.error?.error || 'No se pudo guardar proveedor' }); }
  borrarProveedor(p: Proveedor) { if (p.id_proveedor) this.api.eliminarProveedor(p.id_proveedor).subscribe({ next: () => this.cargar(), error: e => Swal.fire('No se puede eliminar', e.error?.error || '', 'error') }); }
}
