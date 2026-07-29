import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { VentasService } from '../../services/ventas.service';

@Component({
  selector: 'app-checkout-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-panel.html',
})
export class CheckoutPanel {
  @Output() cerrar = new EventEmitter<void>();

  metodoPago: 'credito' | 'transferencia' = 'credito';
  procesando = false;
  errorMsg = '';
  exito = false;

  constructor(public cart: CartService, private ventasService: VentasService) {}

  seleccionarMetodo(metodo: 'credito' | 'transferencia'): void {
    this.metodoPago = metodo;
  }

  confirmarVenta(): void {
    if (this.cart.items().length === 0) return;

    this.procesando = true;
    this.errorMsg = '';

    this.ventasService.registrarVenta(this.cart.items(), this.metodoPago).subscribe({
      next: () => {
        this.procesando = false;
        this.exito = true;
        this.cart.vaciar();
        setTimeout(() => {
          this.exito = false;
          this.cerrar.emit();
        }, 1500);
      },
      error: (err) => {
        this.procesando = false;
        this.errorMsg = err.error?.error || 'No se pudo registrar la venta';
      },
    });
  }
}