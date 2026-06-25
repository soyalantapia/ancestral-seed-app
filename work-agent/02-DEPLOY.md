# 02 · Deploy (runbook)

El proyecto se publica en **dos** destinos independientes. Ambos están **en vivo y al día**.

| Destino | Para qué | URL | Base |
|---|---|---|---|
| **GitHub Pages** | Demo / link para compartir | https://soyalantapia.github.io/ancestral-seed-app/ | `/ancestral-seed-app/` |
| **ancestralseed.com** | "Producción" (dominio propio) | https://ancestralseed.com | `/` |

> 🔐 **Seguridad**: este repo es **público**. Las **credenciales FTP NO están versionadas** y no deben commitearse. Ver la sección de FTP.

---

## Cómo se calcula el `base` (clave para que carguen los assets)

En `vite.config.ts`:

```ts
const BASE = process.env.DEPLOY_BASE ?? '/ancestral-seed-app/'
```

- **Dev** (`npm run dev`): base `/`.
- **GH Pages** (`npm run build` / `npm run deploy`): base `/ancestral-seed-app/` (default).
- **Dominio** (`npm run build:domain`): setea `DEPLOY_BASE=/` → base `/`.

Si el sitio carga en blanco con 404 de assets, casi siempre es el `base` equivocado para el destino.

---

## A. Deploy a GitHub Pages

```bash
cd ~/dev/ancestral-seed
npm run deploy
```

- `predeploy` corre `npm run build` (con base `/ancestral-seed-app/`).
- `gh-pages -d dist` publica `dist/` a la rama `gh-pages`.
- Tarda ~1–2 min en propagar.

---

## B. Deploy a ancestralseed.com (FTP)

Hosting **Ferozo/Apache** (convive con un WordPress en el mismo docroot). Pasos:

```bash
cd ~/dev/ancestral-seed
npm run build:domain          # build con base=/ y VITE_SITE_URL=https://ancestralseed.com
python3 /tmp/ancestral-ftp-deploy.py <HOST> deploy   # sube dist/ + .htaccess
```

### El script de FTP (`/tmp/ancestral-ftp-deploy.py`)
- Es **efímero** (vive en `/tmp`, se borra solo con el tiempo). **Si no existe, hay que recrearlo.**
- Qué hace: conecta por **FTPS** (fallback a FTP plano), hace **backup del `.htaccess` de WordPress** la primera vez (`.htaccess` → `.htaccess.wp.bak`), sube **todos los archivos de `dist/`** recursivamente, y al final sube **`deploy/htaccess-ancestralseed` como `.htaccess`** (el SPA-fallback).
- Modos: `deploy` (sube) · `list` (lista el root remoto, para debug).
- **Credenciales** (host, user, password): **NO están en el repo.** Están dentro del script en `/tmp` o las tiene Alan. Para recrear el script pedírselas a Alan o recuperarlas del historial de la sesión que lo creó. (User de deploy ≈ `deploy@ancestralseed.com` sobre el hosting Ferozo; la pass va en el script.)

### Verificar propagación
El hosting está detrás de CDN (puede tardar). Para confirmar que el bundle nuevo está sirviendo:

```bash
# comparar el hash del CSS local con el que sirve el dominio
LOCALCSS=$(ls dist/assets/*.css | head -1)
curl -sk "https://ancestralseed.com/?cb=$RANDOM" | grep -oE 'index-[A-Za-z0-9_-]+\.css'
# si coincide con $(basename $LOCALCSS) → propagó
```

---

## C. `.htaccess` del SPA (`deploy/htaccess-ancestralseed`)

Se sube como `.htaccess` al docroot. Hace:
1. `DirectoryIndex index.html` antes que `index.php` (convivencia con WordPress).
2. Fuerza **HTTPS**.
3. **SPA fallback**: si el request **no** es archivo ni directorio real → reescribe a `/index.html` (React Router toma el control). Esto permite que `/wp-admin`, `/wp-login.php`, etc. sigan funcionando.
4. MIME para `.webmanifest`/`.json`.
5. **Cache headers**: assets hasheados (`.js/.css/fuentes/img`) `max-age=1 año, immutable`; `index.html`, `mockServiceWorker.js`, `sw.js`, `manifest.webmanifest` → `no-cache` (siempre revalidar — crítico post-deploy para no servir un SW viejo).

---

## D. Env vars relevantes

| Var | Default | Efecto |
|---|---|---|
| `DEPLOY_BASE` | `/ancestral-seed-app/` | base del build (`/` para dominio) |
| `VITE_SITE_URL` | — | dominio para el sitemap / canonical (`build:domain` lo setea) |
| `VITE_USE_MSW` | `true` | si `false`, no arranca MSW → los `/api/*` van al backend real |

---

## E. Prebuild (corre antes de cada `build`)
`npm run prebuild` encadena:
1. `generate-og.mjs` — convierte `public/og-image.svg` → `og-image.png` 1200×630 (las redes no renderizan SVG en el preview).
2. `generate-sitemap.mjs` — genera `public/sitemap.xml` desde los slugs de los mocks + rutas estáticas (usa `VITE_SITE_URL`).
3. `verify-assets.mjs` — **gate de CI**: falla el build si falta alguno de los 9 assets críticos (PDF del reglamento, og-image, logos, íconos PWA, robots, sitemap).

---

## Checklist de deploy (lo que conviene hacer siempre)

```bash
npm run build            # 1. ¿compila? (tsc strict + noUnusedLocals)
# 2. (opcional) verificar en preview / preview_* lo que tocaste
npm run deploy           # 3. GitHub Pages
npm run build:domain && python3 /tmp/ancestral-ftp-deploy.py <HOST> deploy   # 4. dominio
# 5. confirmar propagación del CSS en https://ancestralseed.com
```
