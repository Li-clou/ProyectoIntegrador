import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { RegistroCliente } from './auth/register/register';
import { Homescreen } from './pages/homescreen/homescreen';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
  { path: 'inicio-sesion', component: Login },
  { path: 'registro', component: RegistroCliente },
  { path: 'home', component: Homescreen, canActivate: [authGuard] },
  { path: '**', redirectTo: 'inicio-sesion' },
];