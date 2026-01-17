# Deploy a Vercel - Guía de Configuración

Tu proyecto ha sido configurado para ser desplegado en Vercel. Sigue estos pasos:

## 1. Preparación del Código

El proyecto incluye la siguiente estructura para Vercel:
- `/api` - Serverless functions de Vercel
- `vercel.json` - Configuración de Vercel
- `.vercelignore` - Archivos que Vercel debe ignorar

## 2. Variables de Entorno

Antes de desplegar, copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env.local
```

Variables requeridas:
- `DATABASE_URL`: Conexión a PostgreSQL
- `SESSION_SECRET`: Clave secreta para sesiones
- Otras variables según necesites

## 3. Deploy a Vercel

### Opción A: Usando Vercel CLI

```bash
npm install -g vercel
vercel
```

### Opción B: Usando GitHub

1. Sube tu código a GitHub
2. Ve a https://vercel.com/new
3. Importa tu repositorio
4. Vercel detectará automáticamente la configuración
5. Añade las variables de entorno en Vercel Dashboard
6. Deploy automático

## 4. Configuración en Vercel Dashboard

1. Ve a Settings → Environment Variables
2. Añade todas las variables de tu `.env.local`
3. Asegúrate de que están disponibles para Production

## 5. Estructura de Despliegue

- **Cliente**: Vite build se genera en `dist/public`
- **API**: Serverless functions en carpeta `/api`
- **Base de datos**: Requiere conexión externa (ej: PostgreSQL en la nube)

## 6. Considerations Importantes

- Vercel ejecuta `npm run build` automáticamente
- El servidor Express se ejecuta como Serverless Functions
- Session storage: considera usar una base de datos en lugar de memoria
- WebSockets: No están disponibles en Serverless (considera alternativas)

## 7. Troubleshooting

Si tienes problemas:

1. Revisa los logs en Vercel Dashboard
2. Verifica que todas las variables de entorno están configuradas
3. Asegúrate de que la base de datos es accesible desde Vercel
4. Comprueba que el build script genera `dist/public`

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Node.js en Vercel](https://vercel.com/docs/functions/nodejs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
