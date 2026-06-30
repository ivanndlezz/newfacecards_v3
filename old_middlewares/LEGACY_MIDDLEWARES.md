# Legacy Middlewares

Este directorio contiene una copia local de middlewares PHP antiguos usados por el sistema anterior de NewFace Cards. No debe subirse completo al repositorio: incluye scripts operativos, assets de usuarios, logs y credenciales/API tokens hardcodeados.

El objetivo de conservarlo localmente es analizar el comportamiento del sistema anterior y rescatar conceptos utiles para el nuevo NewFace, no reutilizar estos archivos tal cual.

## Inventario general

- `nfc/*.php`: endpoints PHP sueltos para crear, actualizar y eliminar datos relacionados con perfiles NFC, productos, botones sociales, videos, mapas, imagenes y suscripciones.
- `nfc/profile-pic/`, `nfc/cover/`, `nfc/logo/`, `nfc/maps/`: archivos subidos por usuario, nombrados principalmente con IDs de registros de Airtable.
- `nfc/icons/`: set de iconos para redes sociales, mensajeria, musica, pagos, reservas, mapas y otros enlaces.
- `nfc/backups/`: versiones anteriores de endpoints de consulta/actualizacion.
- `nfc/v2/get_data.php`: intento posterior de obtener datos de Airtable usando variables externas.
- `nfc/subscriptions/`: sincronizacion de suscripciones WooCommerce/WordPress con Airtable, con logs locales.
- `nfc/stats/`: pequenos assets SVG para representar navegador/sistema operativo.
- `old-card-snippet.php`: snippet PHP grande que renderiza la tarjeta/perfil anterior dentro de WordPress. Incluye vista de editor, vista publica, llamadas a Airtable, revision de plan/suscripcion, HTML de tabs, formularios inline, CSS y una seccion comentada de analytics.

## Integraciones detectadas

- Airtable:
  - Base usada por los endpoints antiguos.
  - Tablas principales detectadas: `mail-users`, `productos`, `social_buttons`.
  - Operaciones: `GET`, `POST`, `PATCH`, `DELETE`.
- WordPress:
  - Carga directa de `wp-load.php`.
  - Uso de helpers como `home_url()` y `sanitize_text_field()`.
  - Consulta directa a base de datos via `$wpdb`.
- WooCommerce/subscriptions:
  - Lectura y actualizacion de metadata en `wc_orders_meta`.
  - Sincronizacion de estado/producto/SKU hacia Airtable.
- Sistema de archivos:
  - Guardado y borrado local de imagenes.
  - Rutas absolutas del servidor antiguo.
  - Cache busting via `timestamp` en URLs de imagen.

## Funcionalidades antiguas

- Edicion de perfil NFC:
  - Nombre, cargo, negocio, WhatsApp y otros campos del registro.
  - Foto de perfil, cover, logo, mapa y video.
  - Modo editor activado para el dueno del perfil.
  - Formularios inline por campo usando atributos como `data-field` y `data-set`.
- Gestion de productos:
  - Crear productos vinculados a un usuario.
  - Actualizar descripcion, CTA y precio/datos visuales.
  - Subir imagen de producto.
  - Eliminar producto e imagen asociada.
- Gestion de botones sociales:
  - Crear enlaces sociales asociados al usuario.
  - Detectar URL final tras redirecciones.
  - Elegir icono segun dominio/plataforma.
  - Eliminar boton social.
- Suscripciones:
  - Conectar una suscripcion WooCommerce con el registro de Airtable.
  - Actualizar estado/cancelacion de plan.
- Datos/contacto:
  - Obtener datos de un registro desde Airtable.
  - Generar HTML o respuestas parciales para la UI antigua.
- Render de tarjeta:
  - Resolver usuario desde `/user/{username}`.
  - Leer `user_url` de WordPress y extraer `recid`.
  - Crear registro inicial en Airtable si el usuario aun no tiene `recid`.
  - Renderizar tabs principales: `Contacto`, `Empresa`, `Redes Sociales`.
  - Mostrar una vista editable para el propietario y una vista publica para visitantes.
  - Ocultar/mostrar secciones segun plan, datos disponibles y numero de redes sociales.

## Riesgos y deuda tecnica

- Hay tokens/API keys embebidos en varios scripts. Deben considerarse secretos comprometidos si salen de la maquina local.
- Varios endpoints confian en `HTTP_REFERER` para validar origen. Eso no es autenticacion ni proteccion suficiente.
- Hay mezcla de responsabilidades: validacion, negocio, storage, rendering HTML, llamadas HTTP y manejo de errores viven en el mismo archivo.
- Algunos scripts devuelven HTML de error con estilos completos en vez de respuestas JSON consistentes.
- Las rutas absolutas atan el codigo al servidor anterior.
- El manejo de archivos depende de nombres derivados de IDs externos y de carpetas publicas.
- Hay logs y backups dentro del mismo arbol que los endpoints.
- Hay duplicacion fuerte entre uploads/deletes de `profile-pic`, `cover`, `logo`, `maps` e imagenes de producto.
- `old-card-snippet.php` mezcla bootstrap de datos, creacion de usuarios remotos, validacion de suscripcion, render HTML, CSS, interaccion de editor y tracking en un solo archivo.
- El snippet usa HTML generado desde campos de Airtable como `items_html`, `socials_html`, `items_html_public` y `socials_public_html`, lo que acopla demasiado el almacenamiento con la presentacion.
- La vista publica y la vista editable comparten mucho markup duplicado.

## Conceptos rescatables para NewFace nuevo

- Modelo de perfil modular:
  - Perfil principal con datos personales/negocio.
  - Assets separados: foto, cover, logo, mapa/video.
  - Secciones opcionales por usuario.
- Separacion entre vista publica y editor:
  - Mantener el concepto de una tarjeta publica limpia.
  - Mantener un modo editor para propietarios, pero implementarlo como estado de aplicacion y no como markup PHP duplicado.
  - Usar permisos reales del backend para decidir que acciones puede ejecutar el usuario.
- Navegacion por tabs:
  - `Contacto` como tab base.
  - `Empresa` como tab de negocio, gated por plan si aplica.
  - `Redes Sociales` como tab opcional cuando existan enlaces o cuando el editor quiera agregarlos.
- Bloques/enlaces sociales:
  - Un registro por boton social.
  - Asociacion clara con usuario/perfil.
  - Normalizacion de URL y deteccion de plataforma.
  - Catalogo de iconos por tipo de enlace.
- Productos/servicios vinculados al perfil:
  - Items asociados al usuario.
  - Imagen, descripcion, precio y CTA.
  - Render ordenado dentro de la tarjeta/perfil.
- Sincronizacion externa:
  - Separar el dominio interno del proveedor externo.
  - Diseñar conectores para Airtable/WooCommerce en vez de llamadas directas desde endpoints UI.
- Media pipeline:
  - Redimensionar imagenes al subir.
  - Generar URLs versionadas para evitar cache vieja.
  - Centralizar storage, validacion y borrado.
- Suscripciones:
  - Relacionar plan activo con capacidades del perfil.
  - Registrar eventos de sincronizacion de forma auditable.
- Analytics basicos:
  - Mantener idea de stats por navegador/OS si el nuevo producto necesita metricas de visitas.
  - Registrar visitas como eventos, no como codigo embebido dentro del renderer.

## Conceptos especificos de `old-card-snippet.php`

Este archivo parece ser el render principal de la tarjeta anterior. Es una pieza util para entender UX y modelo de producto, pero no es buena base tecnica para migrar.

Ideas que si conviene rescatar:

- Primer acceso/autoprovisionamiento: si un usuario WordPress no tenia `recid`, se creaba un registro remoto y se guardaba la URL en `user_url`.
- Perfil editable en contexto: el propietario podia tocar un campo y editarlo sin salir de la tarjeta.
- Estados visuales por campo: atributos como `set="true"`, `set="false"` y `placeholder` indicaban si un dato existia.
- Confirmacion antes de borrar imagenes: menus de conservar/borrar para cover, foto y logo.
- Menu movil separado: bottom sheets para acciones de imagen en movil.
- Secciones premium: tab de empresa dependiente de suscripcion/plan.
- Datos comerciales dentro del perfil: logo, titulo de negocio, categoria/slogan, extracto, productos, mapa y video.
- CTA custom: boton personalizable con nombre y URL.
- Catalogo social amplio: deteccion visual por dominios como Instagram, WhatsApp, LinkedIn, Google Maps, PayPal, YouTube, TikTok y otros.
- Vista publica simplificada: visitantes ven solo acciones y contenido, sin controles de edicion.

Ideas que conviene redisenar desde cero:

- No guardar HTML pre-renderizado en Airtable o base de datos. Guardar datos estructurados y renderizar en frontend/backend.
- No crear registros externos desde el renderer de la pagina. Hacerlo desde un flujo de onboarding o servicio de provisionamiento.
- No usar `recid` en query string como fuente principal de identidad publica. Preferir slug/permalink interno y resolver asociaciones en backend.
- No duplicar markup de editor/publico. Usar componentes compartidos con props/estado de permisos.
- No mezclar CSS, PHP, HTML, tracking y operaciones remotas en un snippet.
- No usar `contenteditable` como mecanismo principal sin validacion estructurada.
- No depender de `HTTP_REFERER`, rutas absolutas del servidor ni tokens hardcodeados.

## Recomendacion para migracion conceptual

No reutilizar estos PHP directamente. La ruta sana seria extraer casos de uso y traducirlos a servicios del nuevo sistema:

- `ProfileService`: datos principales del perfil.
- `MediaService`: subida, transformacion, versionado y borrado de imagenes.
- `SocialLinkService`: enlaces sociales, normalizacion de URL e iconos.
- `ProductService`: productos/servicios vinculados a perfiles.
- `SubscriptionService`: estado de plan y sincronizacion con pagos.
- `ExternalSyncService`: adaptadores para Airtable, WooCommerce u otros proveedores.
- `CardRenderer` o componentes de UI: render publico/editorial desde datos estructurados.
- `ProvisioningService`: creacion inicial de perfil y relaciones externas cuando un usuario se activa.

## Regla de manejo en git

El contenido legacy queda ignorado en `.gitignore`. Solo este documento debe mantenerse versionado para guiar el analisis y la migracion.
