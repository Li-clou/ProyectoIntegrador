import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { InventarioService, Producto } from '../../services/inventario.service';
import { VentasService } from '../../services/ventas.service';
import { Cliente,ClientesService } from '../../services/clientes.service';

interface Linea { producto: Producto; cantidad: number; }
@Component({ selector: 'app-ventas', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './ventas.html' })
export class VentasComponent implements OnInit {
  productos: Producto[] = []; carrito: Linea[] = []; historial: any[] = []; buscar = '';
  metodo: 'efectivo'|'tarjeta' = 'efectivo'; montoRecibido = 0; email = ''; error = ''; procesando = false;
  clientes:Cliente[]=[]; idCliente:number|null=null;
  constructor(private inventario: InventarioService, private ventas: VentasService,private clientesApi:ClientesService) {}
  ngOnInit() { this.cargarProductos(); this.cargarHistorial(); this.clientesApi.listar().subscribe(x=>this.clientes=x); }
  cargarProductos() { this.inventario.productos(this.buscar).subscribe(x => this.productos = x.filter(p => p.existencia > 0)); }
  cargarHistorial() { this.ventas.listar().subscribe(x => this.historial = x); }
  agregar(p: Producto) { const linea = this.carrito.find(x => x.producto.id_producto === p.id_producto); if (linea) { if (linea.cantidad < p.existencia) linea.cantidad++; } else this.carrito.push({ producto: p, cantidad: 1 }); }
  quitar(i: number) { this.carrito.splice(i, 1); }
  total() { return this.carrito.reduce((s, x) => s + Number(x.producto.precio_venta) * x.cantidad * (1 + Number(x.producto.iva || 0)/100), 0); }
  confirmar() {
    if (!this.carrito.length) return; if (this.metodo === 'efectivo' && this.montoRecibido < this.total()) { this.error = 'El efectivo recibido es insuficiente'; return; }
    this.procesando = true; this.error = '';
    this.ventas.registrarVenta({ items: this.carrito.map(x => ({ id_producto_dv: x.producto.id_producto!, cantidad: x.cantidad })), metodo_pago: this.metodo, monto_recibido: this.metodo === 'efectivo' ? this.montoRecibido : undefined, email_ticket: this.email || undefined, id_cliente_v:this.idCliente }).subscribe({
      next: v => { this.procesando = false; this.carrito = []; this.montoRecibido = 0; this.email = ''; this.cargarProductos(); this.cargarHistorial(); Swal.fire('Venta registrada', `Folio #${v.id_venta}${v.ticket_enviado ? ' · Ticket enviado' : ''}`, 'success'); },
      error: e => { this.procesando = false; this.error = e.error?.error || 'No se pudo registrar la venta'; }
    });
  }
  abrirTicket(v: any) { this.ventas.ticket(v.id_venta).subscribe(pdf => window.open(URL.createObjectURL(pdf), '_blank')); }
  cancelar(v: any) { Swal.fire({ title: `¿Cancelar venta #${v.id_venta}?`, text: 'El stock será devuelto', icon: 'warning', showCancelButton: true }).then(r => { if (r.isConfirmed) this.ventas.cancelar(v.id_venta).subscribe({ next: () => { this.cargarHistorial(); this.cargarProductos(); }, error: e => Swal.fire('Error', e.error?.error || '', 'error') }); }); }
}
