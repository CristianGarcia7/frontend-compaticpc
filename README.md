# CompatiPC · Frontend

Interfaz web de **CompatiPC**: registras tus equipos, consultas si un componente es compatible y revisas el historial de análisis hechos con IA.

Backend: [backend-compaticpc](https://github.com/CristianGarcia7/backend-compaticpc)

## 🖥️ Pantallas

| Ruta | Qué hace |
|---|---|
| `/login` | Inicio de sesión y registro |
| `/dashboard` | Panel principal con el resumen de tu cuenta |
| `/equipment` | Registro y gestión de tus equipos |
| `/consultation` | Nueva consulta de compatibilidad (RAM, almacenamiento, procesador, GPU o fuente) |
| `/analyses` y `/analyses/[id]` | Historial y detalle: veredicto, revisiones, riesgos, alternativas y PDF |
| `/catalog` | Catálogo de componentes |

## 🧱 Stack

Next.js 16 (App Router) · React 19 · TypeScript · lucide-react

## 🚀 Cómo correrlo

Necesitas el [backend](https://github.com/CristianGarcia7/backend-compaticpc) corriendo.

```bash
cp .env.example .env.local   # API_URL=http://127.0.0.1:3100
pnpm install
pnpm dev                     # http://127.0.0.1:3000
```
