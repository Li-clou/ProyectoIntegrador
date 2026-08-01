import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { RegistroCliente } from './auth/register/register';
import { Homescreen } from './pages/homescreen/homescreen';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';
import { UsuariosComponent } from './pages/usuario/usuario';  

export const routes: Routes = [
  { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
  { path: 'inicio-sesion', component: Login },
  { path: 'registro', component: RegistroCliente },

  // Todo lo que va dentro de esta ruta comparte la misma sidebar.
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Homescreen }, // Pantalla principal para el Admin

      // Descomenta esta línea cuando crees tu componente de ventas para el Cajero
      // { path: 'ventas', component: Ventas },

      // { path: 'inventario', component: Inventario },
      // { path: 'clientes', component: Clientes },

      { path: 'usuarios', component: UsuariosComponent }, // 👈 nuevo
    ],
  },

  { path: '**', redirectTo: 'inicio-sesion' },
];