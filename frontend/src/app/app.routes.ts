import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Homescreen } from './pages/homescreen/homescreen';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';
import { UsuariosComponent } from './pages/usuario/usuario';  
import { InventarioComponent } from './pages/inventario/inventario';
import { VentasComponent } from './pages/ventas/ventas';
import { TurnosComponent } from './pages/turnos/turnos';
import { ClientesComponent } from './pages/clientes/clientes';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
  { path: 'inicio-sesion', component: Login },

  // Todo lo que va dentro de esta ruta comparte la misma sidebar.
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Homescreen, canActivate: [roleGuard], data: { roles: ['admin'] } },

      // Descomenta esta línea cuando crees tu componente de ventas para el Cajero
      { path: 'ventas', component: VentasComponent },

      { path: 'inventario', component: InventarioComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'turnos', component: TurnosComponent },
      { path: 'clientes', component: ClientesComponent },

      { path: 'usuarios', component: UsuariosComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
    ],
  },

  { path: '**', redirectTo: 'inicio-sesion' },
];
