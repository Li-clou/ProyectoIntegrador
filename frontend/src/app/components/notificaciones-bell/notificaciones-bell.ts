import { Component, Input, OnChanges, SimpleChanges, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockAlertService } from '../../services/stock-alert.service';
@Component({
  selector: 'app-notificaciones-bell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './notificaciones-bell.html',
})
export class NotificacionesBell implements OnChanges {
  @Input() rol: 'admin' | 'cajero' | 'pendiente' = 'cajero';
  abierto = signal(false);

  constructor(public alertas: StockAlertService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rol'] && this.rol !== 'pendiente') {
      if (this.rol === 'admin') {
        this.alertas.iniciarMonitoreoAdmin();
      } else {
        this.alertas.iniciarMonitoreoCajero();
      }
    }
  }

  toggle(): void {
    this.abierto.update((v) => !v);
    if (this.abierto()) this.alertas.marcarTodasLeidas();
  }

  formatoHora(fecha: Date): string {
    return new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}