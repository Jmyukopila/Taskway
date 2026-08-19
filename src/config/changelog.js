/* ==========================================================================
   Registro de cambios que ve el usuario.

   Cada entrada nueva va ARRIBA. La app compara la version mas reciente de esta
   lista con la ultima que vio el usuario (guardada en el dispositivo) y, si hay
   entradas por delante, las muestra en una ventana al abrir.

   Al publicar una version: anade la entrada aqui y sube el "version" de
   package.json al mismo numero.

   tipo: 'nuevo' (funcion nueva) | 'arreglado' (bug) | 'mejorado' (cambio de
   comportamiento o diseno existente).
   ========================================================================== */

export const CAMBIOS = [
  {
    version: '1.1.0',
    fecha: '2026-08-19',
    titulo: 'Paquetes de temas',
    cambios: [
      { tipo: 'nuevo', texto: 'Paquetes de temas descargables: cambian iconos, colores y fondo de golpe. Diez para elegir, desde Configuracion.' },
      { tipo: 'nuevo', texto: 'Fondos con patron propio en cada paquete: tablero ichimatsu, olas seigaiha, petalos de cerezo, rejillas y campos de estrellas.' },
      { tipo: 'nuevo', texto: 'Puedes importar y exportar paquetes como archivo para compartirlos.' },
      { tipo: 'nuevo', texto: 'Los paquetes descargados quedan guardados: funcionan sin conexion y viajan en la copia de seguridad.' },
      { tipo: 'nuevo', texto: 'Esta misma ventana: cada actualizacion te cuenta que ha cambiado.' }
    ]
  },
  {
    version: '1.0.0',
    fecha: '2026-08-19',
    titulo: 'Iconos nuevos y una tanda de arreglos',
    cambios: [
      { tipo: 'nuevo', texto: 'Sistema de iconos rehecho: cada familia y variante tiene su propia identidad, y su firma aparece en todos los iconos de la app.' },
      { tipo: 'arreglado', texto: 'Las fechas se calculaban en horario UTC: por la tarde la app saltaba al dia siguiente y las tareas nuevas nacian con la fecha de manana.' },
      { tipo: 'arreglado', texto: 'Algunos habitos antiguos no se dejaban marcar porque su historial estaba guardado con otro nombre interno.' },
      { tipo: 'arreglado', texto: 'Las notificaciones podian repetirse varias veces por la misma tarea.' },
      { tipo: 'arreglado', texto: 'El Pomodoro perdia el tiempo de la fase siguiente al terminar una, y se atrasaba con la app en segundo plano.' },
      { tipo: 'arreglado', texto: 'Buscar tareas sin descripcion cerraba la pantalla.' },
      { tipo: 'arreglado', texto: 'En moviles con notch sobraba margen arriba y abajo.' },
      { tipo: 'mejorado', texto: 'Editar y borrar ya no dependen de un doble toque oculto: cada tarea, habito y clase tiene su boton de acciones.' },
      { tipo: 'mejorado', texto: 'Insignias, mapa de habitos y resumen respetan la paleta del tema elegido.' },
      { tipo: 'mejorado', texto: 'El permiso de notificaciones se pide desde Configuracion, cuando tu quieras.' },
      { tipo: 'mejorado', texto: 'Mas accesible: foco visible con teclado, etiquetas en los botones de icono y respeto por "reducir movimiento".' }
    ]
  }
]

export const VERSION_ACTUAL = CAMBIOS[0].version

/** Compara dos versiones tipo "1.2.3". Devuelve >0 si a es posterior a b. */
export function compararVersiones(a, b) {
  const pa = String(a).split('.').map(n => parseInt(n, 10) || 0)
  const pb = String(b).split('.').map(n => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0)
    if (d !== 0) return d
  }
  return 0
}
