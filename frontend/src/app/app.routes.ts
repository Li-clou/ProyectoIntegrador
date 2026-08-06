import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { RegistroCliente } from './auth/register/register';
import { Homescreen } from './pages/homescreen/homescreen';
import { Homescreen as CajeroHomescreen } from './pages/cajero-homescreen/cajero-homescreen';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';
import { UsuariosComponent } from './pages/usuario/usuario';
import { InventarioComponent } from './pages/inventario/inventario';
import { VentasComponent } from './pages/ventas/ventas';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
  { path: 'inicio-sesion', component: Login },
  {path: 'registro', component: RegistroCliente},

  // Todo lo que va dentro de esta ruta comparte la misma sidebar.
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Homescreen }, // Pantalla principal para el Admin
      { path: 'cajero-homescreen', component: CajeroHomescreen }, // Pantalla principal para el Cajero
      { path: 'inventario', component: InventarioComponent },
      { path: 'ventas', component: VentasComponent },
      // { path: 'clientes', component: Clientes },

      { path: 'usuarios', component: UsuariosComponent },
    ],
  },

  { path: '**', redirectTo: 'inicio-sesion' },
];  