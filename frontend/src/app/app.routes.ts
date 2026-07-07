import { Routes } from '@angular/router';
import { Login } from './auth/login/login';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
    { path: 'inicio-sesion', component: Login }
];