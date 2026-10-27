# Administración de superadmin y eliminaciones

## Configuración local segura

El archivo `.env` está ignorado por Git. Para desarrollo local, usar una instancia de MongoDB local con una base dedicada, por ejemplo:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/cuidarte_dev
DB_NAME=cuidarte_dev
JWT_SECRET=<secreto aleatorio generado solo para desarrollo>
PORT=3001
```

No copiar credenciales ni URI de producción al entorno local. Si se usa un cluster remoto, comprobar desde el proveedor que es un cluster/base de desarrollo y usar credenciales restringidas a esa base. El nombre de la base por sí solo no demuestra que el servidor sea de desarrollo.

La API no crea cuentas ni cambia roles durante el arranque. No se deben incluir valores por defecto para contraseñas o secretos.

## Promoción inicial

El primer `superadmin` se asigna de forma explícita a una cuenta `admin` existente y activa. La API no permite asignarlo a un administrador ordinario mientras no exista ese primer superadmin. Después, solo un `superadmin` puede asignar roles privilegiados; un `admin` puede crear y cambiar usuarios entre `cliente` y `profesional`.

```sh
node scripts/promote-superadmin.js correo-admin-existente@dominio.com
```

El proceso usa `MONGO_URI` y opcionalmente `DB_NAME` del entorno configurado, verifica que aún no haya un superadmin y exige escribir `PROMOVER` en la terminal. No tiene credenciales predeterminadas, no se ejecuta al iniciar la API y no se ejecutó como parte de estos cambios. Confirmar cuidadosamente la base de datos destino antes de usarlo.

La versión de sesión `tokenVersion` tiene valor predeterminado `0`, por lo que no requiere una migración de documentos existentes. Al cerrar sesión, cambiar contraseña, cambiar rol, desactivar una cuenta o promover el primer superadmin, los tokens anteriores de esa cuenta dejan de ser válidos. El cierre de sesión actual invalida las sesiones activas de esa cuenta en todos los dispositivos.

## Recuperación de contraseña

La API implementa la creación y consumo de tokens aleatorios de un solo uso, con hash SHA-256 almacenado y vencimiento de 15 minutos. El cambio de contraseña usa el mismo mínimo de seis caracteres y el mismo hash bcrypt que el modelo de usuario; al completarse incrementa `tokenVersion` para invalidar sesiones previas.

No se encontró un proveedor, transporte SMTP ni configuración de correo existente. Por eso la ruta de solicitud queda deshabilitada y responde `503` de forma idéntica para cualquier dirección; no consulta cuentas ni crea tokens en ese estado. No se deben habilitar solicitudes hasta integrar un proveedor real y configurar un remitente y una URL pública HTTPS para la aplicación. Las pruebas usan un emisor simulado y no envían mensajes.

## Estados operativos y financieros

Los servicios usan `activo`, `pausado`, `finalizado` y `cancelado`. Las coberturas usan `impago`, `parcial` y `pago`; estos valores representan el estado financiero y no reemplazan al estado operativo del servicio. Una cobertura con deuda debe mantenerse visible aunque el servicio esté cancelado o finalizado.

## Borrado definitivo

Las operaciones definitivas usan `DELETE /api/<entidad>/:id/permanent` y exigen autenticación y rol `superadmin`. Los `DELETE /api/<entidad>/:id` existentes conservan su comportamiento administrativo de baja/cancelación.

Las operaciones rechazan registros con dependencias que deban conservarse. No se borran pagos ni referencias de auditoría. La eliminación de un servicio y su cobertura requiere una transacción MongoDB; en un servidor sin soporte de transacciones, la API falla de forma cerrada y no confirma la operación. Antes de usar estas rutas en una base real, respaldar los datos y revisar las dependencias que informe la respuesta de la API.
