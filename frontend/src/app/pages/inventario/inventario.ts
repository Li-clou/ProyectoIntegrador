import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProductosService } from '../../services/producto.service';
import { MarcasService } from '../../services/marca.service';
import { ProveedorService } from '../../services/proveedor.service';
import { Producto, Marca, Proveedor } from '../../models/producto.models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './inventario.html',
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  marcas: Marca[] = [];
  proveedores: Proveedor[] = [];

  cargando = false;
  errorMsg = '';

  busqueda = '';
  filtroMarca: number | 'Todos' = 'Todos';
  soloStockBajo = false;

  mostrarModal = false;
  modoEdicion = false;
  productoSeleccionado: Producto = this.productoVacio();

  mostrarModalStock = false;
  productoAjuste: Producto | null = null;
  cantidadAjuste: number | null = null;
  tipoAjuste: 'entrada' | 'salida' = 'entrada';

  constructor(
    private productosService: ProductosService,
    private marcasService: MarcasService,
    private proveedorService: ProveedorService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarMarcas();
    this.cargarProveedores();
    this.cargarProductos();
  }

  // ===================== CARGA =====================
  cargarProductos(): void {
    this.cargando = true;
    this.errorMsg = '';
    this.productosService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'No se pudieron cargar los productos';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarMarcas(): void {
    this.marcasService.listar().subscribe({
      next: (data) => {
        this.marcas = data;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  cargarProveedores(): void {
    this.proveedorService.listar().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  // ===================== FILTROS =====================
  aplicarFiltros(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.productosFiltrados = this.productos.filter((p) => {
      const coincideTexto =
        !texto ||
        p.nombre_producto.toLowerCase().includes(texto) ||
        p.codigo.toLowerCase().includes(texto);

      const coincideMarca =
        this.filtroMarca === 'Todos' || p.id_marca_producto === this.filtroMarca;

      const coincideStock = !this.soloStockBajo || p.existencia <= p.stock_minimo;

      return coincideTexto && coincideMarca && coincideStock;
    });
  }

  cambiarFiltroMarca(id: number | 'Todos'): void {
    this.filtroMarca = id;
    this.aplicarFiltros();
  }

  toggleStockBajo(): void {
    this.soloStockBajo = !this.soloStockBajo;
    this.aplicarFiltros();
  }

  // ===================== TARJETAS RESUMEN =====================
  get totalProductos(): number {
    return this.productos.length;
  }

  get totalStockBajo(): number {
    return this.productos.filter((p) => p.existencia <= p.stock_minimo).length;
  }

  get valorInventario(): number {
    return this.productos.reduce((acc, p) => acc + p.precio_venta * p.existencia, 0);
  }

  // ===================== HELPERS DE VISTA =====================
  esStockBajo(p: Producto): boolean {
    return p.existencia <= p.stock_minimo;
  }

  // ===================== MODAL CREAR/EDITAR =====================
  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.productoSeleccionado = this.productoVacio();
    this.errorMsg = '';
    this.mostrarModal = true;
  }

  abrirModalEditar(producto: Producto): void {
    this.modoEdicion = true;
    this.productoSeleccionado = { ...producto };
    this.errorMsg = '';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  private productoVacio(): Producto {
    return {
      codigo: '',
      nombre_producto: '',
      id_marca_producto: null,
      precio_compra: null,
      precio_venta: 0,
      existencia: 0,
      stock_minimo: 10,
      iva: 16,
      foto: '',
      id_proveedor: null,
    };
  }

  private validar(): string | null {
    const p = this.productoSeleccionado;
    if (!p.codigo.trim()) return 'El código es obligatorio';
    if (!p.nombre_producto.trim()) return 'El nombre del producto es obligatorio';
    if (!p.precio_venta || p.precio_venta <= 0) return 'El precio de venta debe ser mayor a 0';
    if (p.existencia < 0) return 'La existencia no puede ser negativa';
    if (p.stock_minimo < 0) return 'El stock mínimo no puede ser negativo';
    return null;
  }

  guardarProducto(): void {
    const error = this.validar();
    if (error) {
      this.errorMsg = error;
      return;
    }

    this.cargando = true;

    if (this.modoEdicion && this.productoSeleccionado.id_producto) {
      this.productosService
        .actualizar(this.productoSeleccionado.id_producto, this.productoSeleccionado)
        .subscribe({
          next: () => {
            this.cargando = false;
            this.cerrarModal();
            Swal.fire({
              icon: 'success',
              title: 'Producto actualizado',
              confirmButtonColor: '#4A3B32',
            });
            this.cargarProductos();
          },
          error: (err) => {
            this.cargando = false;
            this.errorMsg = err.error?.error || 'Error al actualizar el producto';
            this.cdr.detectChanges();
          },
        });
    } else {
      this.productosService.crear(this.productoSeleccionado).subscribe({
        next: () => {
          this.cargando = false;
          this.cerrarModal();
          Swal.fire({ icon: 'success', title: 'Producto creado', confirmButtonColor: '#4A3B32' });
          this.cargarProductos();
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err.error?.error || 'Error al crear el producto';
          this.cdr.detectChanges();
        },
      });
    }
  }

  confirmarEliminar(producto: Producto): void {
    Swal.fire({
      icon: 'warning',
      title: `¿Eliminar "${producto.nombre_producto}"?`,
      text: 'Esta acción no se puede deshacer',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4A3B32',
    }).then((result) => {
      if (result.isConfirmed && producto.id_producto) {
        this.productosService.eliminar(producto.id_producto).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Producto eliminado',
              confirmButtonColor: '#4A3B32',
            });
            this.cargarProductos();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'No se pudo eliminar',
              text: err.error?.error || '',
              confirmButtonColor: '#4A3B32',
            });
          },
        });
      }
    });
  }

  // ===================== MODAL AJUSTE DE STOCK =====================
  abrirAjusteStock(producto: Producto, tipo: 'entrada' | 'salida'): void {
    this.productoAjuste = producto;
    this.tipoAjuste = tipo;
    this.cantidadAjuste = null;
    this.errorMsg = '';
    this.mostrarModalStock = true;
  }

  cerrarAjusteStock(): void {
    this.mostrarModalStock = false;
    this.productoAjuste = null;
  }

  confirmarAjusteStock(): void {
    if (!this.productoAjuste?.id_producto) return;
    if (!this.cantidadAjuste || this.cantidadAjuste <= 0) {
      this.errorMsg = 'Ingresa una cantidad válida';
      return;
    }

    this.productosService
      .ajustarStock(this.productoAjuste.id_producto, this.cantidadAjuste, this.tipoAjuste)
      .subscribe({
        next: () => {
          this.cerrarAjusteStock();
          Swal.fire({ icon: 'success', title: 'Stock actualizado', confirmButtonColor: '#4A3B32' });
          this.cargarProductos();
        },
        error: (err) => {
          this.errorMsg = err.error?.error || 'No se pudo ajustar el stock';
          this.cdr.detectChanges();
        },
      });
  }
}
