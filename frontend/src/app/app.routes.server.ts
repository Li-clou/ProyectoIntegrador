import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas públicas: se generan como HTML estático en el build.
  // Son las únicas que le interesan a Google.
  { path: 'inicio-sesion', renderMode: RenderMode.Prerender },
  { path: 'registro', renderMode: RenderMode.Prerender },

  // Todo lo demás (home, cajero-homescreen, inventario, ventas, usuarios)
  // está detrás de login y usa localStorage/sesión del usuario: se renderiza
  // en el cliente (como hasta ahora), no en el servidor. Evita romper el
  // build y evita exponer datos de sesión en HTML pre-generado.
  { path: '**', renderMode: RenderMode.Client },
];