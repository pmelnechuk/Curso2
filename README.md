# Híbrido Box · Prototipo de gestión

Prototipo navegable (HTML + JS, sin dependencias ni build) con dos propuestas visuales para el sistema de gestión del box.

| Carpeta | Contenido |
| --- | --- |
| `index.html` | Portada para elegir la propuesta |
| `propuesta-a-simple/` | Variante 1: simple / operativa (clara, neutra) |
| `propuesta-b-premium/` | Variante 2: premium / fitness (oscura, identidad del logo) |
| `shared/hibrido-core.js` | Datos ficticios, navegación y lógica comunes a las dos |
| `assets/` | Logo |

## Cómo verlo

Abrí `index.html` en el navegador (doble clic alcanza). En cada propuesta, la barra superior cambia entre:

- **Dueño**: login, inicio con indicadores, socios, perfil del socio, pagos, vencimientos, clases, asistencias y profesores.
- **Profesor**: vista de celular con búsqueda, cobro en 3 toques, alta de socio y clases.
- **Recepción**: tablet de check-in por DNI con teclado físico. DNIs de prueba: `40223519` (activa), `38901442` (vence mañana), `35482117` (vencida), `30111222` (no registrado). Vuelve sola al campo DNI después de unos segundos.

Atajos por URL: `#panel` (entra directo al panel del dueño), `#profesor`, `#recepcion`.

Todos los datos son ficticios y viven en memoria: al recargar la página se reinician.
