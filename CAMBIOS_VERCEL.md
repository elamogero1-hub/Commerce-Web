# Resumen de Cambios para Vercel

## Archivos Creados

1. **vercel.json** - Configuración principal de Vercel
   - Define builds para cliente (Vite) y servidor (Serverless functions)
   - Configura rutas para manejar API y cliente
   - Establece funciones con memoria y timeout apropiados

2. **api/[...route].ts** - Handler principal de Serverless Functions
   - Maneja todas las solicitudes de API
   - Inicializa Express una sola vez (para performance)
   - Incluye soporte CORS

3. **api/index.ts** - Handler alternativo (respaldo)
   - Puede usarse como entrada adicional si es necesario

4. **.vercelignore** - Archivos ignorados en el deploy
   - Excluye node_modules, scripts, servidor local, etc.

5. **.env.example** - Template de variables de entorno
   - Incluye DATABASE_URL, SESSION_SECRET, etc.

6. **VERCEL_DEPLOYMENT.md** - Guía completa de deployment
   - Instrucciones paso a paso
   - Configuración de variables de entorno
   - Troubleshooting

## Archivos Modificados

1. **package.json**
   - Añadido script `build:client`: Compila solo el cliente con Vite
   - Modificado `build`: Ejecuta ambos builds
   - Añadido `vercel-build`: Para Vercel (ejecuta build)

2. **vite.config.ts**
   - Hecho runtimeErrorOverlay() condicional (solo con REPL_ID)
   - Mejora compatibilidad con Vercel

## Próximos Pasos

1. **Configurar Base de Datos**
   - Vercel requiere base de datos externa
   - Opciones recomendadas:
     * PostgreSQL en la nube (Render, Railway, Supabase)
     * Managed databases

2. **Configurar Variables de Entorno en Vercel**
   - Ve a Project Settings > Environment Variables
   - Añade DATABASE_URL y otras variables necesarias

3. **Hacer Push a GitHub**
   ```bash
   git add .
   git commit -m "Preparar proyecto para Vercel"
   git push
   ```

4. **Conectar con Vercel**
   - Opción 1: CLI (`vercel`)
   - Opción 2: Importar desde GitHub

## Consideraciones Importantes

### WebSockets
- **No disponibles** en Vercel Serverless Functions
- Si necesitas WebSockets, considera:
  - Polling con React Query
  - Server-Sent Events (SSE)
  - Firebase Realtime DB o similar

### Session Storage
- **No uses Memory Store** en production
- Implementa con PostgreSQL o Redis
- El código actual usa `connect-pg-simple` (✓ compatible)

### Límites de Vercel
- Timeout máximo: 30 segundos por defecto
- Memory: 1024 MB (configurable hasta 3008 MB)
- Request body: 6 MB

## Validación Local

```bash
# Instalar Vercel CLI (opcional)
npm install -g vercel

# Simular deployment localmente
vercel dev

# O usando npm
npm run dev
```

## Estructura Final

```
Commerce-Web/
├── api/                    # ← Nuevas serverless functions
│   ├── index.ts
│   └── [...route].ts
├── client/                 # Cliente React (sin cambios)
├── server/                 # Lógica de servidor (mismo código)
├── shared/                 # Compartido
├── vercel.json            # ← Nueva configuración
├── .vercelignore          # ← Archivos a ignorar
├── .env.example           # ← Template de env vars
├── VERCEL_DEPLOYMENT.md   # ← Esta guía
└── package.json           # Modificado (scripts)
```

## Recursos

- [Vercel Node.js Deployment](https://vercel.com/docs/functions/nodejs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Database Options](https://vercel.com/storage)
