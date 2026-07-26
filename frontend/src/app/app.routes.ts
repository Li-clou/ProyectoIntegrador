import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { RegistroCliente } from './auth/register/register';
import { Homescreen } from './pages/homescreen/homescreen';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
  { path: 'inicio-sesion', component: Login },
  { path: 'registro', component: RegistroCliente },

  // Todo lo que va dentro de esta ruta comparte la misma sidebar.
  // Para agregar una pantalla nueva (inventario, ventas, etc.) solo
  // se agrega aquí adentro, no hay que tocar la sidebar ni el layout.
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Homescreen },
      // { path: 'inventario', component: Inventario },
      // { path: 'ventas', component: Ventas },
      // { path: 'clientes', component: Clientes },
    ],
  },

  { path: '**', redirectTo: 'inicio-sesion' },
];