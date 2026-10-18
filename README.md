# CompatiPC · Frontend

Interfaz web de **CompatiPC**: registras tus equipos, consultas si un componente es compatible y revisas el historial de análisis hechos con IA.

Backend: [backend-compaticpc](https://github.com/CristianGarcia7/backend-compaticpc)

## 🖥️ Pantallas

| Ruta | Qué hace |
|---|---|
| `/` | Página pública: propuesta de valor, cómo funciona y registro gratis |
| `/precios` | Planes de referencia en COP con prueba gratis |
| `/terminos` y `/privacidad` | Términos de uso y política de privacidad (Ley 1581 de 2012) |
| `/login` | Inicio de sesión y registro (`?mode=register\|login`, `?next=/ruta` para volver a la página solicitada) |
| `/dashboard` | Panel principal con el resumen de tu cuenta |
| `/equipment` | Registro y gestión de tus equipos |
| `/consultation` | Nueva consulta de compatibilidad (RAM, almacenamiento, procesador, GPU, fuente, batería o cargador), con ejemplos por campo y ayuda «¿Dónde encuentro esto?» |
| `/analyses` y `/analyses/[id]` | Historial y detalle: veredicto, reglas técnicas, advertencias, riesgos, alternativas, retroalimentación y PDF |
| `/catalog` | Catálogo de componentes con enlace a la ficha técnica oficial |
| `/ayuda` | Ayuda y preguntas frecuentes |

## 🧠 Datos en el cliente

`lib/session-store.ts` guarda la configuración, la sesión y los datos del espacio de trabajo a nivel de módulo: se cargan una vez por sesión del navegador, las peticiones simultáneas se comparten y las mutaciones actualizan el estado local sin recargar todo.

## 🧱 Stack

Next.js 16 (App Router) · React 19 · TypeScript · lucide-react

## 🚀 Cómo correrlo

Necesitas el [backend](https://github.com/CristianGarcia7/backend-compaticpc) corriendo.

```bash
cp .env.example .env.local   # API_URL=http://127.0.0.1:3100
pnpm install
pnpm dev                     # http://127.0.0.1:3000
```
