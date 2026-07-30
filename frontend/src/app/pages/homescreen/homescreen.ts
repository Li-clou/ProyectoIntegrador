import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { HttpClient, HttpClientModule } from '@angular/common/http'; // <-- Importación para conectar con el backend
import Swal from 'sweetalert2';
import { CartService } from '../../services/cart.service';
import { CheckoutPanel } from '../../components/checkout-panel/checkout-panel';
import { AuthService } from '../../services/auth.services'; 

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioSmall: number;
  precioLarge: number;
  imagen: string;
  tamanoSeleccionado: 'small' | 'large';
  cantidad: number;
}

@Component({
  selector: 'app-homescreen',
  standalone: true,
  // Se agregó HttpClientModule a los imports
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, HttpClientModule], 
  templateUrl: './homescreen.html',
  styleUrl: './homescreen.css',
})
export class Homescreen implements OnInit {
  terminoBusqueda = '';
  panelAbierto = signal(false);

  // --- VARIABLES DEL HEADER Y DASHBOARD ---
  usuarioActual: string = 'Cargando...';
  fechaActual: Date = new Date();

  // Objeto para almacenar las estadísticas reales que vienen de PostgreSQL
  stats: any = {
    ventasDia: 0,
    transacciones: 0,
    cajerosActivos: 0,
    productosVendidos: 0,
    inventarioBajo: 0
  };

  // --- CATÁLOGO DE PRODUCTOS ---
  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Cappuccino',
      descripcion: 'Espuma de leche cremosa con un shot de espresso intenso.',
      precioSmall: 1.5,
      precioLarge: 2.0,
      imagen: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
    {
      id: 2,
      nombre: 'Coffee Latte',
      descripcion: 'Espresso suave con leche vaporizada y un toque de dulzura.',
      precioSmall: 1.6,
      precioLarge: 2.1,
      imagen: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
    {
      id: 3,
      nombre: 'Americano',
      descripcion: 'Espresso diluido con agua caliente, sabor intenso y limpio.',
      precioSmall: 1.55,
      precioLarge: 2.05,
      imagen: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
    {
      id: 4,
      nombre: 'Espresso',
      descripcion: 'Shot puro y concentrado, la base de todo buen café.',
      precioSmall: 1.2,
      precioLarge: 1.6,
      imagen: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
    {
      id: 5,
      nombre: 'Mocha',
      descripcion: 'Espresso con chocolate y leche vaporizada, dulce y cremoso.',
      precioSmall: 1.7,
      precioLarge: 2.2,
      imagen: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
    {
      id: 6,
      nombre: 'Macchiato',
      descripcion: 'Espresso marcado con una pequeña capa de espuma de leche.',
      precioSmall: 1.65,
      precioLarge: 2.15,
      imagen: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
    {
      id: 7,
      nombre: 'Cold Brew',
      descripcion: 'Café de extracción fría, suave y con menos acidez.',
      precioSmall: 1.8,
      precioLarge: 2.3,
      imagen: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
    {
      id: 8,
      nombre: 'Flat White',
      descripcion: 'Espresso doble con leche vaporizada en textura sedosa.',
      precioSmall: 1.75,
      precioLarge: 2.25,
      imagen: 'https://images.unsplash.com/photo-1519082274554-2c14bc5e10ee?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
    {
      id: 9,
      nombre: 'Caramel Latte',
      descripcion: 'Latte clásico con un toque de caramelo dulce y suave.',
      precioSmall: 1.85,
      precioLarge: 2.35,
      imagen: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
    {
      id: 10,
      nombre: 'Frappé',
      descripcion: 'Café helado batido, refrescante y con mucha espuma.',
      precioSmall: 1.9,
      precioLarge: 2.4,
      imagen: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
      tamanoSeleccionado: 'small',
      cantidad: 1,
    },
  ];

  constructor(
    public cart: CartService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient // <-- Inyectamos HttpClient para poder hacer la petición GET
  ) {}

  ngOnInit(): void {
    // 1. Validar la sesión y obtener el nombre del usuario
    this.authService.me().subscribe({
      next: (res) => {
        this.usuarioActual = res.usuario.nombre_us || 'Administrador';
      },
      error: () => {
        this.router.navigate(['/inicio-sesion']);
      }
    });

    // 2. Cargar las estadísticas del dashboard
    this.cargarEstadisticas();
  }

  // --- FUNCIÓN PARA CONECTAR AL BACKEND Y TRAER LAS MÉTRICAS ---
  cargarEstadisticas(): void {
    this.http.get('http://localhost:3000/api/dashboard/stats', { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          this.stats = res;
        },
        error: (err) => console.error('Error al cargar métricas del dashboard:', err)
      });
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/inicio-sesion']);
      },
      error: (err) => console.error('Error al cerrar sesión', err)
    });
  }

  abrirFiltro(): void {
    console.log('Filtrando con:', this.terminoBusqueda);
  }

  seleccionarTamano(producto: Producto, tamano: 'small' | 'large'): void {
    producto.tamanoSeleccionado = tamano;
  }

  precioActual(producto: Producto): number {
    return producto.tamanoSeleccionado === 'small' ? producto.precioSmall : producto.precioLarge;
  }

  aumentarCantidad(producto: Producto): void {
    producto.cantidad++;
  }

  disminuirCantidad(producto: Producto): void {
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  async preguntarCantidadYAgregar(producto: Producto): Promise<void> {
    let cantidadSeleccionada = 0;

    const result = await Swal.fire({
      title: `¿Cuántos "${producto.nombre}" deseas agregar?`,
      html: `
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
          cantidadSeleccionada++;
          contador.textContent = String(cantidadSeleccionada);
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
      const cantidadNum = result.value as number;

      this.cart.agregar({
        idProducto: producto.id,
        nombre: producto.nombre,
        tamano: producto.tamanoSeleccionado,
        precioUnitario: this.precioActual(producto),
        cantidad: cantidadNum,
      });

      Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        text: `${producto.nombre} (${producto.tamanoSeleccionado}) x${cantidadNum}`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    }
  }

  agregarAlCarrito(producto: Producto): void {
    this.cart.agregar({
      idProducto: producto.id,
      nombre: producto.nombre,
      tamano: producto.tamanoSeleccionado,
      precioUnitario: this.precioActual(producto),
      cantidad: producto.cantidad,
    });

    Swal.fire({
      icon: 'success',
      title: 'Producto agregado',
      text: `${producto.nombre} (${producto.tamanoSeleccionado}) x${producto.cantidad}`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }
}