BEGIN;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_unique ON usuarios (LOWER(email)) WHERE email IS NOT NULL;

ALTER TABLE turnos ADD COLUMN IF NOT EXISTS tipo_turno VARCHAR(20);
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMP;
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS monto_final NUMERIC(12,2) DEFAULT 0;
UPDATE turnos SET tipo_turno = CASE
  WHEN EXTRACT(HOUR FROM fecha_inicio) < 14 THEN 'matutino'
  WHEN EXTRACT(HOUR FROM fecha_inicio) < 21 THEN 'vespertino'
  ELSE 'nocturno' END WHERE tipo_turno IS NULL;
ALTER TABLE turnos ALTER COLUMN tipo_turno SET DEFAULT 'matutino';
ALTER TABLE turnos ALTER COLUMN tipo_turno SET NOT NULL;
ALTER TABLE turnos DROP CONSTRAINT IF EXISTS turnos_tipo_turno_check;
ALTER TABLE turnos ADD CONSTRAINT turnos_tipo_turno_check CHECK (tipo_turno IN ('matutino','vespertino','nocturno'));
CREATE UNIQUE INDEX IF NOT EXISTS turno_abierto_por_usuario ON turnos(id_usuario) WHERE estado = 'ABIERTO';

ALTER TABLE venta ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA';
ALTER TABLE venta ADD COLUMN IF NOT EXISTS cancelada_por INTEGER REFERENCES usuarios(id_usuario);
ALTER TABLE venta ADD COLUMN IF NOT EXISTS fecha_cancelacion TIMESTAMP;

ALTER TABLE productos ALTER COLUMN stock_minimo SET DEFAULT 10;
UPDATE productos SET stock_minimo = 10 WHERE stock_minimo IS NULL OR stock_minimo < 10;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS id_proveedor INTEGER REFERENCES proveedor(id_proveedor);

INSERT INTO proveedor (nombre_pv, direccion_pv, telefono_pv)
SELECT 'Proveedor general', 'Por definir', '0000000000'
WHERE NOT EXISTS (SELECT 1 FROM proveedor);

WITH proveedor_base AS (SELECT id_proveedor FROM proveedor ORDER BY id_proveedor LIMIT 1),
faltantes AS (SELECT GREATEST(0, 10 - COUNT(*))::int AS cantidad FROM productos),
candidatos AS (
  SELECT n,
         'CAF-' || LPAD(n::text, 3, '0') AS codigo,
         (ARRAY['Espresso','Americano','Capuchino','Latte','Moca','Té chai','Chocolate','Frappé','Cold brew','Pan dulce'])[n] AS nombre_producto,
         proveedor_base.id_proveedor
  FROM proveedor_base, faltantes, generate_series(1, faltantes.cantidad) AS n
)
INSERT INTO productos (codigo, nombre_producto, precio_compra, precio_venta, existencia, stock_minimo, iva, id_proveedor)
SELECT c.codigo, c.nombre_producto, 20 + c.n, 35 + c.n * 3, 20, 10, 16, c.id_proveedor
FROM candidatos c
WHERE NOT EXISTS (SELECT 1 FROM productos p WHERE p.codigo = c.codigo);

COMMIT;
