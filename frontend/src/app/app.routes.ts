import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { RegistroCliente } from './auth/register/register';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
    { path: 'inicio-sesion', component: Login },
    { path: 'registro', component: RegistroCliente }
];