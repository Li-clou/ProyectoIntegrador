import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CartService } from '../../services/cart.service';
import { CheckoutPanel } from '../../components/checkout-panel/checkout-panel';
import { ProductosService } from '../../services/producto.service';

interface ProductoUI {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  existencia: number;
  cantidad: number;
}

const IMAGEN_DEFECTO = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400';

@Component({
  selector: 'app-homescreen',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckoutPanel],
  templateUrl: './cajero-homescreen.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './cajero-homescreen.css',
})
export class Homescreen implements OnInit {
  terminoBusqueda = '';
  panelAbierto = signal(false);

  cargando = false;
  errorMsg = '';

  productos: ProductoUI[] = [];
  private productosOriginales: ProductoUI[] = [];

  constructor(
    public cart: CartService,
    private productosService: ProductosService,
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.errorMsg = '';
    this.productosService.listar().subscribe({
      next: (data) => {
        this.productosOriginales = data.map((p) => this.mapearProducto(p));
        // Reaplica el filtro de búsqueda actual en vez de perderlo al refrescar
        this.abrirFiltro();
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'No se pudieron cargar los productos';
      },
    });
  }

  private mapearProducto(p: any): ProductoUI {
    return {
      id: p.id_producto,
      nombre: p.nombre_producto,
      descripcion: p.nombre_marca ? `Marca: ${p.nombre_marca}` : '',
      precio: Number(p.precio_venta),
      imagen: p.foto || IMAGEN_DEFECTO,
      existencia: p.existencia,
      cantidad: 1,
    };
  }

  abrirFiltro(): void {
    const texto = this.terminoBusqueda.trim().toLowerCase();
    this.productos = !texto
      ? this.productosOriginales
      : this.productosOriginales.filter((p) => p.nombre.toLowerCase().includes(texto));
  }

  // Cuánto de este producto ya está en el carrito (para no dejar agregar de más)
  private cantidadEnCarrito(idProducto: number): number {
    return this.cart
      .items()
      .filter((i) => i.idProducto === idProducto)
      .reduce((acc, i) => acc + i.cantidad, 0);
  }

  disponible(producto: ProductoUI): number {
    return producto.existencia - this.cantidadEnCarrito(producto.id);
  }

  aumentarCantidad(producto: ProductoUI): void {
    if (producto.cantidad < this.disponible(producto)) {
      producto.cantidad++;
    }
  }

  disminuirCantidad(producto: ProductoUI): void {
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  async preguntarCantidadYAgregar(producto: ProductoUI): Promise<void> {
    const disponible = this.disponible(producto);

    if (disponible <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin stock disponible',
        text: `No quedan unidades disponibles de "${producto.nombre}".`,
        confirmButtonColor: '#6F4E37',
      });
      return;
    }

    let cantidadSeleccionada = 0;

    const result = await Swal.fire({
      title: `¿Cuántos "${producto.nombre}" deseas agregar?`,
      html: `
        <p style="font-size:12px;color:#94a3b8;margin-bottom:8px;">Disponibles: ${disponible}</p>
        <div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-top:12px;">
          <button type="button" id="btn-menos"
            style="width:44px;height:44px;border-radius:12px;border:none;background:#f1f5f9;color:#334155;font-size:22px;font-weight:bold;cursor:pointer;line-height:1;">
            −
          </button>
          <span id="contador-cantidad"
            style="min-width:48px;text-align:center;font-size:32px;font-weight:700;color:#20140C;">
            0
          </span>
          <button type="button" id="btn-mas"
            style="width:44px;height:44px;border-radius:12px;border:none;background:#6F4E37;color:#fff;font-size:22px;font-weight:bold;cursor:pointer;line-height:1;">
            +
          </button>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6F4E37',
      cancelButtonColor: '#94a3b8',
      didOpen: () => {
        const popup = Swal.getPopup();
        const contador = popup?.querySelector('#contador-cantidad') as HTMLElement;
        const btnMenos = popup?.querySelector('#btn-menos') as HTMLButtonElement;
        const btnMas = popup?.querySelector('#btn-mas') as HTMLButtonElement;

        btnMenos.addEventListener('click', () => {
          if (cantidadSeleccionada > 0) {
            cantidadSeleccionada--;
            contador.textContent = String(cantidadSeleccionada);
          }
        });

        btnMas.addEventListener('click', () => {
          if (cantidadSeleccionada < disponible) {
            cantidadSeleccionada++;
            contador.textContent = String(cantidadSeleccionada);
          }
        });
      },
      preConfirm: () => {
        if (cantidadSeleccionada < 1) {
          Swal.showValidationMessage('Selecciona al menos 1 producto');
          return false;
        }
        return cantidadSeleccionada;
      },
    });

    if (result.isConfirmed) {
      this.agregarAlCarritoConCantidad(producto, result.value as number);
    }
  }

  agregarAlCarrito(producto: ProductoUI): void {
    this.agregarAlCarritoConCantidad(producto, producto.cantidad);
  }

  private agregarAlCarritoConCantidad(producto: ProductoUI, cantidad: number): void {
    const disponible = this.disponible(producto);

    if (cantidad > disponible) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock insuficiente',
        text:
          disponible > 0
            ? `Solo quedan ${disponible} unidades disponibles de "${producto.nombre}".`
            : `Ya tienes en tu orden todo el stock disponible de "${producto.nombre}".`,
        confirmButtonColor: '#6F4E37',
      });
      return;
    }

    this.cart.agregar({
      idProducto: producto.id,
      nombre: producto.nombre,
      tamano: 'unico',
      precioUnitario: producto.precio,
      cantidad,
    });

    // Reinicia el selector de cantidad de la tarjeta
    producto.cantidad = 1;

    Swal.fire({
      icon: 'success',
      title: 'Producto agregado',
      text: `${producto.nombre} x${cantidad}`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }

  // Al cerrar el panel de checkout (con o sin venta exitosa), refrescamos
  // el stock real: si hubo venta, baja la existencia; si no, no cambia nada.
  onCerrarPanel(): void {
    this.panelAbierto.set(false);
    this.cargarProductos();
  }
}
