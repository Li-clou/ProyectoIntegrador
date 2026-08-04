import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { VentasService } from '../../services/ventas.service';

@Component({
  selector: 'app-checkout-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-panel.html',
})
export class CheckoutPanel {
  @Output() cerrar = new EventEmitter<void>();

  metodoPago: 'efectivo' | 'tarjeta' | 'credito' = 'efectivo';
  montoRecibido: number | null = null;
  emailTicket = '';

  procesando = false;
  errorMsg = '';
  exito = false;

  constructor(public cart: CartService, private ventasService: VentasService) {}

  seleccionarMetodo(metodo: 'efectivo' | 'tarjeta' | 'credito'): void {
    this.metodoPago = metodo;
    if (metodo !== 'efectivo') {
      this.montoRecibido = null;
    }
  }

  get cambio(): number | null {
    if (this.metodoPago !== 'efectivo' || this.montoRecibido === null) return null;
    const cambio = this.montoRecibido - this.cart.total();
    return cambio >= 0 ? cambio : null;
  }

  get puedeConfirmar(): boolean {
    if (this.cart.items().length === 0 || this.procesando) return false;
    if (this.metodoPago === 'efectivo') {
      return this.montoRecibido !== null && this.montoRecibido >= this.cart.total();
    }
    return true;
  }

  confirmarVenta(): void {
    if (!this.puedeConfirmar) return;

    this.procesando = true;
    this.errorMsg = '';

    const montoRecibido = this.metodoPago === 'efectivo' ? this.montoRecibido! : undefined;

    this.ventasService.registrarVenta(this.cart.items(), this.metodoPago, montoRecibido).subscribe({
      next: (venta: any) => {
        this.procesando = false;
        this.exito = true;
        this.cart.vaciar();
        this.descargarTicket(venta.id_venta);

        setTimeout(() => {
          this.exito = false;
          this.cerrar.emit();
        }, 1800);
      },
      error: (err) => {
        this.procesando = false;
        console.error('Error al registrar venta:', err);
        this.errorMsg = err.error?.error || 'No se pudo registrar la venta';
      },
    });
  }

  private descargarTicket(idVenta: number): void {
    const email = this.emailTicket.trim() || undefined;

    this.ventasService.obtenerTicket(idVenta, email).subscribe({
      next: (pdfBlob: Blob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${idVenta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        // La venta ya se registró aunque falle el ticket, no bloqueamos el flujo
        console.error('No se pudo generar el ticket de la venta', idVenta, err);
      },
    });
  }
}