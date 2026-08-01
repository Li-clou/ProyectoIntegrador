export type Rol = 'admin' | 'cajero' | null;

export interface Usuario {
  id_usuario?: number;
  nombre_us: string;
  ap_us: string;
  am_us: string;
  direccion?: string;
  telefono?: string;
  usuario: string;
  password?: string; // solo se manda al crear
  rol: Rol;
}