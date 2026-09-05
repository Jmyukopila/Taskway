# Taskway · SAVIO (extensión de navegador)

Importa las entregas del calendario de SAVIO (Moodle de la UTB) a Taskway **sin
salir de tu sesión**. El portal está detrás de Cloudflare y no se puede consultar
desde un servidor; la extensión hace la descarga desde tu propio navegador, donde
el reto de Cloudflare ya está resuelto y tienes sesión iniciada.

## Cómo funciona

1. Cuando visitas `savio.utb.edu.co`, un content script descarga tu `.ics` del
   calendario (con `preset_time=recentupcoming`) y lo guarda en la extensión.
   Como mucho una vez cada 30 min.
2. Si hay UIDs de eventos que no había visto, muestra una notificación.
3. Al pulsar la notificación (o "Importar ahora" en el popup), abre Taskway y le
   inyecta el `.ics` en `localStorage['taskway-savio-ics']`.
4. Taskway, al cargar, lo procesa con su propia lógica (`src/lib/savioImport.js`):
   empareja cada entrega con tu materia del Horario, crea solo lo nuevo y mueve
   las fechas que cambiaron. Nunca toca una tarea completada o editada a mano.

La extensión **no parsea ni entiende** el calendario: solo lo transporta. Toda la
inteligencia vive en la app.

## Instalación (sin firmar, modo desarrollador)

1. `chrome://extensions` → activa **Modo de desarrollador**.
2. **Cargar descomprimida** → elige esta carpeta `extension/`.
3. Botón derecho sobre el icono → **Opciones**:
   - **URL del calendario de SAVIO**: en SAVIO, Calendario → *Exportar calendario*
     → *Semana/mes que viene* → copia la URL (contiene `userid` y `authtoken`).
   - **URL de Taskway**: la dirección exacta donde abres la app.
   - **Conceder permiso para Taskway** (necesario para inyectarle el archivo).
4. Abre `savio.utb.edu.co`. A los pocos segundos deberías ver la sincronización
   en el popup.

## Permisos y por qué

| Permiso | Para qué |
|---|---|
| `host_permissions: savio.utb.edu.co` | descargar tu `.ics` desde la página |
| `optional_host_permissions: https://*/*` | pedirte permiso para **tu** URL de Taskway (solo esa) |
| `scripting` | inyectar el `.ics` en la pestaña de Taskway |
| `storage` | guardar tus dos URLs y el último `.ics` |
| `notifications` | avisarte de entregas nuevas |
| `alarms` | (reservado para sondeo periódico futuro) |

Nada sale de tu navegador: la extensión no habla con ningún servidor propio.

## Seguridad

La URL del calendario lleva un token equivalente a una contraseña de solo
lectura. Se guarda en `chrome.storage.sync` (tu perfil de Chrome). Si la
compartes o sospechas que se filtró, recréala en SAVIO: *Preferencias → Claves de
seguridad → restablecer la de "Exportar calendario"*.

## Limitaciones

- Solo sincroniza mientras navegas SAVIO (no en segundo plano con el navegador
  cerrado). El content script no puede correr sin una pestaña de SAVIO abierta.
- Si Cloudflare te pide el reto al entrar, resuélvelo una vez; la siguiente carga
  de página ya sincroniza.
- La inyección en Taskway recarga la pestaña.
