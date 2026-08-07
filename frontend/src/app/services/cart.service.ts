import { Injectable, signal, computed } from '@angular/core';

export interface ItemCarrito {
  idProducto: number;
  nombre: string;
  tamano: string; // <-- CORREGIDO: Ya no es opcional (eliminé el '?')
  precioUnitario: number;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<ItemCarrito[]>([]);
  items = this._items.asReadonly();

  total = computed(() =>
    this._items().reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
  );

  cantidadTotal = computed(() =>
    this._items().reduce((acc, i) => acc + i.cantidad, 0)
  );

  agregar(item: ItemCarrito): void {
    const existente = this._items().find(
      (i) => i.idProducto === item.idProducto && i.tamano === item.tamano
    );

    if (existente) {
      this._items.update((lista) =>
        lista.map((i) =>
          i === existente ? { ...i, cantidad: i.cantidad + item.cantidad } : i
        )
      );
    } else {
      this._items.update((lista) => [...lista, item]);
    }
  }

  quitar(idProducto: number, tamano: string): void {
    this._items.update((lista) =>
      lista.filter((i) => !(i.idProducto === idProducto && i.tamano === tamano))
    );
  }

  actualizarCantidad(idProducto: number, tamano: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.quitar(idProducto, tamano);
      return;
    }
    this._items.update((lista) =>
      lista.map((i) =>
        i.idProducto === idProducto && i.tamano === tamano ? { ...i, cantidad } : i
      )
    );
  }

  vaciar(): void {
    this._items.set([]);
  }
}