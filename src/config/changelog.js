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
    version: '1.3.0',
    fecha: '2026-09-05',
    titulo: 'Importar tareas de SAVIO',
    cambios: [
      { tipo: 'nuevo', texto: 'Configuración → Universidad → Importar de SAVIO: descarga el calendario (.ics) de tu Moodle desde el navegador y súbelo. Taskway crea solo las entregas que aún no tienes y empareja cada una con su materia del Horario.' },
      { tipo: 'nuevo', texto: 'Si una entrega ya importada cambia de fecha en SAVIO, al reimportar se actualiza; nunca toca una tarea que ya completaste o editaste.' }
    ]
  },
  {
    version: '1.2.1',
    fecha: '2026-09-05',
    titulo: 'Académico sincronizado con el Horario',
    cambios: [
      { tipo: 'mejorado', texto: 'Académico gira sobre las materias del Horario: una materia aunque tengas varias clases de ella, con una sola tarjeta de notas y un solo grupo de tareas.' },
      { tipo: 'mejorado', texto: 'Renombrar o borrar una materia en el Horario arrastra sus tareas y sus notas. Al borrarla, las tareas conservan la materia como texto.' },
      { tipo: 'nuevo', texto: 'La pestaña Tareas de Académico lista todas tus materias, aunque no tengan tareas, con un botón para añadirles una directamente.' },
      { tipo: 'nuevo', texto: 'Puedes crear una materia en el Horario sin salir de Académico.' }
    ]
  },
  {
    version: '1.2.0',
    fecha: '2026-09-05',
    titulo: 'Sección académica: materias, tareas y notas',
    cambios: [
      { tipo: 'nuevo', texto: 'Sección Académico (donde antes estaba Resumen): reúne tus tareas por materia, tus notas y el resumen de siempre, cada uno en su pestaña.' },
      { tipo: 'nuevo', texto: 'Notas por materia: define tus cortes con su peso (30/30/40 o el que uses), anota cada parcial, quiz o taller y la app calcula la nota de cada corte y la definitiva proyectada.' },
      { tipo: 'nuevo', texto: 'Cada tarea puede llevar su materia y su nota de 0 a 5. Las notas de las tareas se listan aparte y no se mezclan con el cálculo de los cortes.' },
      { tipo: 'nuevo', texto: 'Paquete de temas Warrior: fantasía oscura de eclipse carmesí, mandoble y tinta sobre acero.' },
      { tipo: 'mejorado', texto: 'Calendario nuevo: la hoja del mes toma el color del tema, los días marcan tareas, clases y eventos con leyenda, y puedes editar una tarea desde el día seleccionado.' },
      { tipo: 'mejorado', texto: 'El calendario, la barra inferior y los iconos siguen el color y la forma del tema o paquete activo, siempre con contraste legible en claro y oscuro.' },
      { tipo: 'mejorado', texto: 'Las tareas completadas se muestran tachadas y con sus mismas acciones, en vez de atenuadas y sin botones.' }
    ]
  },
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
