# 01 · Arquitectura

SPA React 19 + Vite 8 + Tailwind v4. Routing con React Router v7, estado con Zustand (persistido), datos con MSW. **Sin backend real.**

---

## 1. Rutas completas (`src/routes.tsx`)

### Público — `Layout` (Header + Footer + CommandPalette + CookieBanner)

| Ruta | Componente | Notas |
|---|---|---|
| `/` | `Home` | Landing: hero (video), featured certs, mapa LATAM, secciones de proceso |
| `/directorio` | `Directory` | Búsqueda + filtros (categoría, estado, sort) + filtro client-side por categoría oficial |
| `/certificado/:slug` | `CertificationDetail` | Ficha pública del certificado (verificación, QR, compartir, imprimir) |
| `/autor/:slug` y `/perfil/:slug` | `AuthorProfile` | Perfil público del autor (toma portada del 1er cert) |
| `/verificar` | `Verify` | Verifica por hash o slug |
| `/nosotros` | `Nosotros` | Institucional |
| `/login` | `Login` | Login **mock** (cualquier email+clave) |
| `/registro` | `Signup` | Alta de postulante |
| `/recuperar` | `RecoverPassword` | Reset (UI mock) |
| `/certificar` | `CertifyForm` | Wizard de 7 pasos (autosave en `certifyForm` store) |
| `/denuncias` | `Denuncias` | Denuncia pública de fraude |
| `/legal/:section` | `Legal` | `:section` ∈ `terminos | privacidad | cookies`. ⚠️ `/legal` sin sección = 404 |
| `*` | `NotFound` | 404 ("Esta semilla no germinó") |

### Postulante — `RequireAuth` → `DashboardLayout` (sidebar/drawer + BottomNav + HelpBubble)

| Ruta | Componente |
|---|---|
| `/mis-certificaciones` | `MyCertifications` (dashboard principal) |
| `/mis-certificaciones/:id` | `CertificationRequest` (detalle: pestañas **Seguimiento · Evaluación · Auditoría · Evidencias**) |
| `/mis-certificaciones/:id/renovar` | `Renovar` |
| `/mis-certificaciones/:id/apelar` | `Apelar` |
| `/mis-certificaciones/:id/plan-mejora` | `PlanMejora` |
| `/mi-perfil` | `MyProfile` (3 tabs: Mi perfil · Mis destacados · Mis certificados) |
| `/notificaciones` | `Notifications` |
| `/calendario` | `Calendario` |
| `/pagos` | `Pagos` (checkout + facturas — centraliza TODO lo de pagos) |
| `/ayuda` | `Help` / `Ayuda` |
| `/mis-datos` | `MisDatos` (derechos del titular GDPR/LGPD/Ley 25.326) |
| redirects legacy | `/inicio`, `/dashboard`, `/documentos`, `/configuracion` → redirigen |

### Tutor — `RequireTutor` → `TutorLayout` (sidebar propio + topbar con búsqueda global)

| Ruta | Componente |
|---|---|
| `/tutor/dashboard` | `TutorDashboard` (KPIs, tareas, agenda, "casos esperan tu firma") |
| `/tutor/casos` | `TutorCases` (kanban por etapa) |
| `/tutor/casos/:id` | `TutorCaseDetail` (expediente en pestañas) |
| `/tutor/agenda` | `TutorAgenda` |
| `/tutor/tareas` | `TutorTasks` |
| `/tutor/certificaciones` | `TutorCertifications` (histórico emitido) |
| `/tutor/certificaciones/:id` | `TutorCertificationDetail` |

### Roles especiales (dentro de `RequireAuth`)
- `/comprador/wallet` → `BuyerWallet` (B2B)
- `/coordinador/equipo` → `CoordinadorEquipo`

---

## 2. Auth & roles

- **Store**: `src/store/auth.ts` (Zustand + `persist`, key `ancestral-seed-auth`, version 1). Estado: `user`, `token`, `isAuthenticated`.
- **Roles** (`UserRole`): `postulante | tutor | evaluador | coordinador | admin`. El `User` tiene `role` (principal) y `roles[]` (multi-rol). `normalizeUser()` da default demo `role='postulante'`, `roles=['postulante','tutor']`.
- **Login mock**: `POST /api/auth/login` devuelve siempre **Camila Montes** (`u-001`, `camila@ancestralseed.org`) con token mock. Cualquier email+clave entra.
- **Guards**:
  - `RequireAuth`: si no autenticado → `/login` (guardando `from`); si ok → `DashboardLayout`.
  - `RequireTutor`: exige `role/roles` incluyendo `tutor` o `admin`; si autenticado sin rol → 403 inline; si ok → `TutorLayout`.
- **Logout**: confirm → `resetDemoStores({forLogout:true})` (limpia todos los stores, evita leaks entre cuentas) → `clearSession()`.
- **Cambiar de panel**: la cuenta demo tiene ambos roles → el menú de usuario permite saltar postulante ⇄ tutor.

---

## 3. Layouts (`src/components/features/`)

- **`Layout.tsx`** — público. Header + Outlet + Footer + SkipToContent + HashScrollHandler + CommandPalette + CookieBanner.
- **`DashboardLayout.tsx`** — postulante. Sidebar (desktop) / drawer (mobile) con nav (Certificaciones, Notificaciones, Pagos, Perfil, Ayuda) + botón Tutorial (dispara `GuidedTour`) + Logout; BottomNav en mobile; HelpBubble (FAB).
- **`TutorLayout.tsx`** — tutor. Sidebar propio (Operaciones / Gestión) + topbar con búsqueda global, campana, avatar-dropdown; link "Volver al panel de solicitante".
- **`RequireAuth.tsx`** / **`RequireTutor.tsx`** — guards (ver arriba).

---

## 4. Stores Zustand (`src/store/`) — ~15, todos con `persist`

| Store | Maneja |
|---|---|
| `auth` | sesión (user/token/isAuthenticated) |
| `ui` | flags de UI (menú mobile, banners dismissed) |
| `onboarding` | tours activos (`solicitante`/`tutor`/`certifyForm`), step, completados |
| `certifyForm` | datos del wizard de certificación (autosave) |
| `settings` | preferencias (email, tema, canales de notificación, privacidad) |
| `notifications` | notificaciones in-app |
| `tutorCases` | kanban del tutor (casos por etapa) |
| `tutorTasks` | tareas del tutor |
| `caseSignatures` | firmas de evaluación por caso |
| `certChecklist` | progreso del checklist del tutor por cert |
| `internalNotes` | notas internas del tutor por entidad |
| `coverByRequest` | override de portada por solicitud |
| `buyerWallet` | certs guardados (rol comprador) |
| `lastVisit` | timestamp de última visita (bloque "lo nuevo") |
| `resetDemo` | utilitario para resetear TODOS los stores |

---

## 5. Hooks (`src/hooks/`)
`useFocusTrap` (foco atrapado en modal, Tab circular, restaura foco previo — usado por `modal.tsx` y ahora `sheet.tsx`), `useEscape` (cerrar con Esc), `useThemeEffect` (light/dark), `useCertifications` (query/cache de certs), `useAutoStartTour` (arranca tour en primer login).

---

## 6. Modelo de datos (`src/types/index.ts`)

Entidades centrales (campos clave):

- **`Author`**: `id, slug, name, title, bio, avatarUrl, location?, email?, certificationsCount, joinedAt, community?, languages?`.
- **`Certification`**: `id, slug, title, authorId/Slug/Name/Avatar, issuedBy, issuedAt, expiresAt?, status` (`verified|pending|expired|revoked`), `category, description, coverUrl, hash`; + Reglamento de Marca: `officialCategory` (`autentico|tradicional|inspiracion`), `entityType` (`producto|servicio`), `licenseStatus` (`vigente|suspendida|cancelada`), `licenseValidUntil?, licenseNumber?`; + geo/cultura: `location?, mapQuery?, contextParagraphs?[], techniqueParagraphs?[], galleryUrls?[]`.
- **`CertificationRequest`** (expediente del postulante): `id, number, productName, createdAt, currentStage` (`prediagnostico|inicio|diagnostico|auditoria|evaluacion|certificacion`), `status, progressLabel, diagnosticDeadline?, stages[], pendingItems[], meetings[], scheduledMeetings[], evidences?[], payments?[], history?[], threads?{}, submittedData?`.
- **`AuditMeeting`**: `id, auditorName, type, scheduledAt, timezone, message, status` (`pending|accepted|rejected|rescheduled`). ⚠️ `auditorName` es nombre de campo interno (no visible) — se dejó así aunque en UI se diga "Tutor".
- **`HistoryEvent`**: `id, kind, title, description?, actor` (`'Tú'|'Tutor'|'Sistema'`), `at`.
- **`PaymentItem`**: `id, concept, amount, currency, status` (`pending|paid|overdue|refunded`), `dueDate, paidAt?, invoiceUrl?`.
- **`User`**: `id, email, name, avatarUrl?, authorSlug?, role?, roles?`.

### Datos mock clave (`src/services/mocks/data.ts`)
- **4 autores**: `camila-montes` (Camila Montes, **Nariño**, tradicional), `maria-belen-baulo` (Córdoba AR, inspiración), `flor-imbacuan-pantoja` (Nariño, auténtico), `ecodestinos` (servicio, tradicional).
- **9 certificaciones** (4 featured + 5 placeholder). Featured slugs: `tecnica-ancestral-filigrana`, `tejido-textil-tradicional`, `libro-sabores-cosmicos`, `ecodestinos-turismo-ancestral`.
- **Solicitud demo**: `req-001` ("Filigrana ancestral", prediagnóstico, con evidencias, 1 pago pendiente $45.000 ARS, historial de 8 eventos, 1 reunión propuesta).
- **Tutor**: `Lic. Juan Pérez` (constante `TUTOR_NAME`).
- **Diagnóstico del tutor** (read-only): constante `tutorDiagnosis` en `CertificationRequest.tsx`.
- **Categorías**: `['Caribe colombiano', 'Córdoba', 'Nariño', 'Colombia']`.
- **Hash de verificación válido**: `0xA3F9C2D81E47B5106F3C2A99D8E1F4B7C0D5A2E69B8F1C4D3E2A1B0F9C8E7D6`.

---

## 7. Contrato de API (`src/services/api.ts`) — lo que el backend debe implementar

```
GET  /api/certifications?q=&category=&status=&sortBy=   → { items, total, page, pageSize }
GET  /api/certifications/:slug                          → Certification
GET  /api/certifications/featured                       → Certification[]   (4 curadas)
POST /api/certifications/verify   { hashOrCode }         → { valid, certification? }
GET  /api/authors                                       → Author[]
GET  /api/authors/:slug                                 → Author
GET  /api/authors/:slug/certifications                  → Certification[]
GET  /api/categories                                    → string[]
POST /api/auth/login   { email, password }              → { user, token }
POST /api/auth/logout                                   → { ok }
POST /api/incidents    { certificationId, reason, ... } → { ok, ticketId }
```

**MSW**: handlers en `src/services/mocks/handlers.ts`, worker en `browser.ts`. Latencia simulada ~120–300ms. Se apaga con `VITE_USE_MSW=false`. El matcher de rutas contempla el base de GH Pages (`/ancestral-seed-app/api/...`). Hay un fix de convivencia MSW ↔ Workbox (el SW de PWA se auto-destruye para no pisar el scope de MSW).

---

## 8. Design system / tokens (`src/index.css`, `@theme inline`)

**Marca**: gold (acento) + navy (primario), tipografía **Montserrat**, `--radius: 0.75rem`.

Escalas (valores **actuales**, ya con los fixes de la auditoría):

```
gold:    50 #faf6e6 · 100 #f4eccc · 200 #ead999 · 300 #dfc666 · 400 #d3b333 ·
         500 #c7a800 (primary) · 600 #a28000 · 700 #796000 · 800 #514000 · 900 #282000
navy:    50 #eef2f7 · 100 #66773a · 200 #4c6074 · 300 #334060 · 400 #19334c ·
         500 #001c38 (primary) · 600 #01192e · 700 #00101f · 800 #00080f
cream:   50 #fbf8ef
neutral: 0 #ffffff · 100 #e3deed · 200 #dce4ee · 300 #d7e0ec · 400 #d3dde4 · 500 #c1ccda · 600 #99a9b8 · 700 #8c8e9c
success: 100 #f8fff9 · 200 #ecf5fb · 300 #0f9918 · 400 #0ab011 · 700 #0a6b12
warning: 100 #fff5ec · 200 #f5d28e · 300 #edb445 · 400 #a47611 · 500 #7a5600
error:   100 #fefefb · 200 #f0cfce · 300 #e54545 · 400 #b82828
info:    50 #fafcff · 100 #f5f9ff · 200 #bcdde6 · 300 #3f9cad · 400 #2a5e75
```

> ⚠️ **Cuidado al agregar tokens**: si usás una clase Tailwind tipo `bg-X-50` cuyo `--color-X-50` no existe en `@theme`, **no se genera regla CSS y el tinte no se aplica** (falla silenciosa). Antes de la auditoría había varios así (gold-50/cream-50/navy-50/info-50/success-700) + dos con hex inválido. Verificá contra el CSS compilado (`dist/assets/*.css`) si dudás.

- **Patterns**: `.bg-pattern-gold`, `.bg-pattern-aztec`, `.bg-pattern-strip`, `.bg-pattern-navy`, `.bg-greca-gold`.
- **Dark mode**: hay tokens semánticos para `.dark` y un `ThemeToggle`, pero el producto se usa principalmente en claro.
- **`CategoryBadge.tsx`** mapea las categorías oficiales a color: Auténtico (gold), Tradicional (success), **Inspiración** (warning, texto `warning-500` para AA).

---

## 9. Componentes destacados (`src/components/`)
- **ui/**: `button, card, input, label, badge, modal, sheet, combobox, accordion, skeleton`.
- **features/**: `Header, Footer, BottomNav, Breadcrumbs, CommandPalette` (⌘K), `GuidedTour`/`OnboardingTour` (tours en `lib/tours.ts`), `CertificationCard, StagePipeline` (pipeline de etapas), `CategoryBadge, LicenseStatusBadge, OfficialSeal, Charts, LatamWorldMap` (react-simple-maps), `CheckoutModal, AddPaymentModal, ChangePasswordModal, ConfirmDialog, InternalNotesPanel, HelpBubble, CookieBanner, InstallPrompt` (PWA), `ErrorBoundary, PageMeta`.
