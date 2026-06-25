# 04 · Gotchas del entorno & decisiones tomadas

Cosas que NO son obvias del código y que te van a ahorrar horas.

---

## Entorno / build

- **iCloud rompe el build.** El proyecto real vive en `~/dev/ancestral-seed`; en `~/Desktop/Programacion/` hay sólo un **symlink**. Desktop está sincronizado por iCloud, que corrompe `esbuild`/`rollup`/`lightningcss`. **Editá y corré todo desde `~/dev/ancestral-seed`.**
- **Node 22** recomendado.
- **TypeScript es `strict` + `noUnusedLocals` + `noUnusedParameters`.** Si borrás código (ej. un componente), **tenés que limpiar sus imports/variables o el build falla**. Siempre verificá con `npm run build` antes de commitear. (En la última sesión, borrar `PagosTab` dejó imports huérfanos — `tsc` los cazó y hubo que limpiarlos.)
- **`sed` para borrados grandes**: el `Edit` por string no sirve para borrar funciones de cientos de líneas. Sirve `sed -i '' 'A,Bd'` PERO **cuidado**: verificá que el rango no incluya otras funciones (en esta sesión un rango se comió `HistorialTab` + `ChangeRequestDialog` por error; siempre `awk '/^function /{print NR}'` el rango primero y hacé `cp` de backup).

---

## Git / repo

- **Repo público**: `github.com/soyalantapia/ancestral-seed-app`. **No commitear secretos** (credenciales FTP, tokens). Las creds de FTP del dominio se mantienen fuera del repo (ver [`02-DEPLOY.md`](./02-DEPLOY.md)).
- **Acá SÍ se pushea a `main`.** A diferencia de los repos de Deenex (donde hay regla dura de no tocar main), este proyecto trabaja directo sobre `main` (ver `git log`). Es el patrón establecido.
- `gh` está configurado como `soyalantapia` (token sin scope `workflow`).

---

## MSW / PWA / Service Worker

- Todo `/api/*` lo intercepta **MSW** (no hay backend). Se apaga con `VITE_USE_MSW=false`.
- **Convivencia MSW ↔ PWA**: el SW de `vite-plugin-pwa` se genera con `selfDestroying: true` + `injectRegister: null` para **no pisar el scope del Service Worker de MSW**. No "arregles" esto pensando que es un bug.
- **Post-deploy**: `index.html`, `mockServiceWorker.js`, `sw.js` y el manifest van con `no-cache` en el `.htaccess` — es a propósito, para no servir un SW viejo tras un deploy.
- El matcher de handlers contempla el base de GH Pages (`/ancestral-seed-app/api/...`), por eso los mocks andan tanto en `/` como en el subpath.

---

## Cuentas demo & roles (para QA)

- **Login es mock**: cualquier email + cualquier clave entra; la sesión es siempre **Camila Montes** (`camila@ancestralseed.org`), con roles `['postulante','tutor']`.
- **Forzar un rol desde la consola del navegador** (útil para QA del panel tutor):
  ```js
  const k='ancestral-seed-auth'; const o=JSON.parse(localStorage.getItem(k));
  o.state.user.role='tutor';   // o 'postulante'
  localStorage.setItem(k, JSON.stringify(o)); location.reload();
  ```
- **Resetear la demo** (limpia todos los stores): `useUiStore.getState().resetDemoState()` desde la consola, o el botón de reset si está visible.
- La solicitud de demo es **`req-001`** (Filigrana ancestral). El hash de verificación válido está en [`01-ARQUITECTURA.md`](./01-ARQUITECTURA.md) §6.

---

## Claude Preview (mcp Claude_Preview) — flakiness conocida

Si usás el preview embebido para QA, ojo con estos quirks (vistos en la última sesión):
- **Los screenshots a veces sirven frames fantasma / en blanco / de otra ruta** (apareció un 404 de `/consorcios` que no existía). **Confirmá el estado real por DOM** (`preview_eval` con `document.querySelector(...)`), no sólo por screenshot.
- **El viewport se resetea al top** después de algunos screenshots → cuesta capturar secciones bajo el fold.
- Si el preview queda en mal estado, **reiniciá el server** (`preview_stop` + `preview_start`) — limpia ghosts de HMR.
- El **mapa LATAM es lazy-loaded** (IntersectionObserver + topojson async): renderiza recién al scrollearlo a viewport y esperar ~2–3s. Si ves `paths: 0`, no está roto, todavía no cargó.

---

## Decisiones de producto/diseño ya tomadas (no re-litigar sin razón)

- **"Tutor", no "auditor"**: la persona que revisa el caso es el **Tutor**. Se mantiene "auditoría" para el **proceso** ("auditoría cultural") y "Auditoría" como **etapa/pestaña**.
- **El diagnóstico lo carga el tutor**, el postulante **sólo lo lee** (read-only). No volver a hacerlo un formulario que llena el postulante.
- **Pagos NO va en las pestañas del detalle** — está centralizado en `/pagos`.
- **Marca/categorías**: Auténtico / Tradicional / Inspiración cultural (+ tipo producto/servicio). Ecodestinos es **Servicio**.
- **Camila Montes es de Nariño** (San Juan de Pasto), pueblos Pastos·Quillasingas. (Antes estaba mal puesta en el Caribe/Sierra Nevada.)
- **Verde (`success`) está reservado** semánticamente; el ahorro/positivo. El warning era rosa por un hex roto — ya es ámbar.
