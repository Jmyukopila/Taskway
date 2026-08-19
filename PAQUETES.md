# Paquetes de temas

Un paquete cambia de golpe **los iconos, la paleta y el fondo** de Taskway. Es
un único archivo JSON, así que se puede descargar del catálogo de la app,
exportar, pasárselo a alguien e importarlo desde Configuración → Paquetes de
temas.

## Cómo se distribuyen

- Los paquetes viven en `public/packs/` y se sirven como archivos estáticos
  desde el mismo dominio de la app: **no hace falta backend**.
- `public/packs/catalogo.json` es la lista que ve el usuario. Para publicar uno
  nuevo basta con dejar el `.json` en esa carpeta, añadir su ficha al catálogo y
  desplegar.
- Al descargarlo se guarda en el dispositivo (`localStorage`) y el service
  worker cachea la petición, así que sigue disponible sin conexión y viaja en el
  backup de datos.

## Formato (versión 1)

```json
{
  "formato": 1,
  "id": "mecha",
  "nombre": "Mecha",
  "descripcion": "Hangar de acero, cian de reactor y ambar de alerta",
  "autor": "Taskway",
  "base": "acero",
  "svg": { "strokeWidth": 2.5, "strokeLinecap": "square", "strokeLinejoin": "miter" },
  "motivo": [ [["M", 0, -1], ["L", 1, 0], ["L", 0, 1], ["L", -1, 0], ["Z"]] ],
  "colores": {
    "dark":  { "fondo": "#0a0f14", "card": "#111a22", "teal": "#38BDF8", "text": "#e6f1f7" },
    "light": { "fondo": "#f2f6f9", "card": "#e6edf3", "teal": "#0284C7", "text": "#0b1720" }
  },
  "fondo": {
    "dark":  { "capas": [ { "tipo": "rejilla", "color": "#38bdf814", "grosor": 1, "paso": 32 } ] },
    "light": { "capas": [ { "tipo": "rejilla", "color": "#0284c714", "grosor": 1, "paso": 32 } ] }
  }
}
```

### `base` y `svg`

`base` elige el lenguaje de formas de los iconos: `clasico` (círculos y
rectángulos), `flora` (orgánico, esquinas muy suaves) o `acero` (hexágonos y
cortes en diagonal). `svg` ajusta el trazo: `strokeWidth` 0.5–4,
`strokeLinecap` butt/round/square y `strokeLinejoin` miter/round/bevel.

### `motivo`

Es la firma del paquete: se dibuja en el punto focal de cada icono (el núcleo
del sol, el día marcado del calendario, el centro de la diana, la marca del
reloj, el sello de la tarea y el pico del gráfico).

Se define en **coordenadas unitarias** alrededor del origen — `[-1, 1]` es el
tamaño natural — y la app lo escala y coloca en cada icono. Comandos admitidos:
`M`, `L`, `C`, `Q`, `A` y `Z` (`A` es el arco elíptico: `rx, ry, rotación,
arco-grande, barrido, x, y`).

Dos reglas que importan: las formas deben estar **cerradas** y **no solaparse
entre sí**. En los iconos rellenos el motivo se resta del contorno con
`fill-rule: evenodd`, y dos formas superpuestas volverían a rellenar el hueco.
Anidar una forma dentro de otra sí vale: produce un anillo.

### `colores`

Claves disponibles (todas opcionales; lo que no definas se hereda del tema
base): `fondo`, `card`, `card-hover`, `border`, `text`, `text-secondary`,
`muted`, `teal`, `teal-hover`, `purple`, `purple-hover`, `success`, `warning`,
`danger`. `teal` es el acento principal y `purple` el secundario.

Define `dark` y `light`: el usuario puede cambiar de modo con el paquete puesto.
Solo se aceptan hexadecimales (`#rgb`, `#rrggbb` o `#rrggbbaa`).

### `fondo`

Hasta 6 capas por modo, de la de arriba a la de abajo:

| `tipo`    | Parámetros                                                    |
|-----------|---------------------------------------------------------------|
| `radial`  | `color`, `x`, `y`, `ancho`, `alto` (en %)                     |
| `lineal`  | `color`, `color2`, `angulo`                                   |
| `puntos`  | `color`, `radio`, `paso` (px)                                 |
| `rayas`   | `color`, `grosor`, `paso`, `angulo`                           |
| `rejilla` | `color`, `grosor`, `paso`                                     |
| `patron`  | `forma`, `color`, `paso`, `alto`, `grosor`, `relleno`         |

Usa colores con alfa (`#rrggbbaa`) y mantén los fondos discretos: las tarjetas
van encima y el texto tiene que seguir leyéndose.

### La capa `patron`

Es la que permite dibujar de verdad, no solo degradados: `forma` es una lista de
subpaths (mismos comandos que el motivo) dentro de una **casilla de 0 a 1** que
luego se repite por todo el fondo. `paso` es el lado de la casilla en píxeles y
`alto` su proporción (`0.5` = casilla el doble de ancha que alta). Con
`relleno: true` la forma se pinta maciza; si no, se traza con `grosor` (medido
sobre una casilla de 100 unidades).

Para que no se vean costuras, lo que toca un borde de la casilla debe continuar
en el borde opuesto. Los paquetes incluidos usan esta capa para patrones
tradicionales japoneses, todos de dominio público: `ichimatsu` (tablero de
damas), `seigaiha` (olas de semicírculos concéntricos en filas desplazadas media
onda) y pétalos sueltos de cerezo.

## Seguridad

Un paquete es un archivo que puede venir de cualquier parte, así que la app lo
valida entero antes de usarlo (`src/lib/packSchema.js`): colores solo en
hexadecimal, números acotados, tipos de capa de una lista cerrada y comandos de
path limitados. No se evalúa código ni se inyectan cadenas CSS tal cual. Si algo
no cuadra, el paquete se rechaza con un mensaje concreto.

## Sobre los paquetes incluidos

Los diez paquetes del catálogo son **diseños originales inspirados en géneros y
en motivos tradicionales de dominio público**, no en obras concretas: no usan
personajes, logos ni nombres de series o películas existentes.

- Inspirados en géneros: Shonen, Mecha, Magia, Retro VHS, Ópera espacial, Kaiju,
  Espectro urbano.
- Construidos sobre patrones tradicionales japoneses (dominio público):
  Ichimatsu (tablero de damas y estrella de cáñamo), Sakura (pétalos de cerezo)
  y Seigaiha (olas).

Si creas paquetes propios para distribuirlos, conviene mantener ese criterio: un
patrón tradicional o una paleta se pueden usar libremente, el diseño de un
personaje o el logotipo de una serie no.
