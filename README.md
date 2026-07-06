# Viaje a la Playa 🏖️

App para organizar el viaje a Matanzas (Navidad, O'Higgins) del 17 al 19 de julio: gastos compartidos, compras, itinerario y clima, sin login — solo elegís tu nombre.

Stack: Next.js (App Router) + Supabase (Postgres, Realtime, Storage) + Tailwind CSS. Deploy en Vercel.

## Setup

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Crear el proyecto en Supabase** (https://supabase.com) y correr el schema:
   - SQL Editor > New query > pegar `supabase/schema.sql` completo > Run
   - Repetir con `supabase/seed.sql` para precargar a los 10 participantes

3. **Variables de entorno**: copiar `.env.local.example` a `.env.local` y completar con los datos de tu proyecto (Project Settings > API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

4. **Correr en local**

   ```bash
   npm run dev
   ```

   Abrir http://localhost:3000

## Avatares de los participantes

Las fotos de perfil se guardan en el bucket `avatars` de Supabase Storage y se referencian desde `participants.avatar_url`. Dos formas de cargarlas:

### Opción A — Script (recomendada, una sola vez)

1. Juntá las 10 fotos en una carpeta, cada una nombrada igual que el participante (no importan mayúsculas ni tildes): `Jorge.jpg`, `Nikole.png`, `Isidora.jpg`, `Javier.jpg`, `Cristobal.jpg`, `Fiorella.jpg`, `Kiara.jpg`, `Alonso.jpg`, `Camila.jpg`, `Sebastian.jpg`.
2. Con `.env.local` ya configurado, corré:

   ```bash
   npm run avatars -- ./ruta/a/tu/carpeta
   ```

   El script sube cada foto al bucket `avatars` y actualiza el `avatar_url` del participante correspondiente. Si corres el comando de nuevo (por ejemplo para reemplazar una foto), simplemente pisa la anterior.

### Opción B — Manual desde el dashboard de Supabase

1. Storage > bucket `avatars` > Upload file (subí las 10 fotos).
2. Por cada archivo subido, click derecho > Copy URL (o "Get URL", debe ser pública).
3. Table Editor > `participants` > pegar esa URL en la columna `avatar_url` de la fila correspondiente.

## Estructura del proyecto

```
src/
  app/
    page.tsx            # inicio
    gastos/              # ruta /gastos
    compras/             # ruta /compras
    itinerario/          # ruta /itinerario
  components/
    splash/             # pantalla de bienvenida (avatares flotantes)
    header/              # countdown, clima, feed de actividad
    identity/            # selector de nombre, badge, avatar gate
    expenses/             # módulo de gastos/cuotas
    shopping/             # módulo de lista de compras
    itinerary/            # módulo de itinerario
    nav/                  # navegación inferior
    ui/                   # componentes compartidos (Avatar, etc)
  lib/
    supabase/            # clientes de Supabase (browser/server)
    constants.ts         # destino, fechas del viaje, categorías, nombre del grupo
    database.types.ts    # tipos manuales de las tablas
    expenses.ts           # cálculo de balances y simplificación de deudas
    shopping.ts           # mapeo de categoría compras -> categoría gasto
    activity.ts           # helper para el feed de actividad reciente
    participant-context.tsx  # identidad actual (localStorage)
supabase/
  schema.sql            # schema completo (tablas, RLS, realtime, storage)
  seed.sql               # participantes iniciales
scripts/
  upload-avatars.mjs     # sube avatares en batch
```

## Deploy en Vercel

### 1. Subir el proyecto a GitHub (si todavía no lo hiciste)

```bash
git add .
git commit -m "Viaje a la playa: gastos, compras, itinerario, avatares"
```

Creá un repo vacío en [github.com/new](https://github.com/new) (no lo inicialices con README) y luego:

```bash
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git branch -M main
git push -u origin main
```

### 2. Importar en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new) con tu cuenta (podés loguearte con GitHub directamente).
2. Elegí el repo que acabás de subir > **Import**. Vercel detecta que es Next.js solo, no hace falta tocar el build command ni el output directory.
3. Antes de tocar "Deploy", abrí **Environment Variables** y agregá las mismas dos variables que tenés en `.env.local`:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | la URL de tu proyecto Supabase (Project Settings > API) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la anon/publishable key del mismo lugar |

   Dejalas marcadas para los tres entornos (Production, Preview, Development) así funciona igual si Vercel genera previews de PRs.
4. Click **Deploy**. Vercel instala dependencias, corre `next build` y en 1-2 minutos te da una URL pública (`https://<tu-proyecto>.vercel.app`).

### 3. Después del primer deploy

- **Cada `git push` a `main` redeploya solo** — no hace falta volver a tocar Vercel.
- Si en algún momento cambiás las variables de entorno en Vercel, tenés que forzar un **Redeploy** (Vercel no reinicia solo con un cambio de env vars).
- Si agregás más participantes o cambiás fechas/destino, hacelo en Supabase (tabla `participants`) y en `src/lib/constants.ts` respectivamente, y pusheá — no requiere tocar la config de Vercel.
- Compartí la URL de Vercel con el grupo. No hay login: cada uno entra, elige su nombre (o se agrega) y listo.
