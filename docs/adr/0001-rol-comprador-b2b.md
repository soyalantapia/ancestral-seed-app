# ADR 0001 · Rol "Comprador / Marca / Distribuidor"

**Status:** Aceptado
**Fecha:** 2026-05-28
**Decisores:** Producto + Eng

## Contexto

Fix #FEAT-01 del análisis de proyecto. Hasta ahora Ancestral Seed
tiene 3 roles activos: `postulante`, `tutor` y `visitante público
anónimo`. La pitch del Home menciona "comprador en Tokio que escanea
y verifica" — pero ese flujo es one-shot anónimo.

Para B2B (marca europea con 200 proveedores, distribuidor que recibe
facturas semanales), una verificación 1-by-1 no escala.

## Decisión

Introducir un cuarto rol: `comprador`.

- Tipo en `UserRole` union.
- Layout dedicado bajo `/comprador/*`.
- Wallet de hashes guardados (store `useBuyerWalletStore`).
- Alertas push (in-app + email cuando habilitado) si un cert
  guardado cambia a `suspendido/denegado/cancelado`.
- API key pública futura para integrar a su ecommerce/POS.

## Consecuencias

✅ Modelo B2B viable.
✅ Revenue diversificado (postulante + tutor + comprador suscripción).
❗ Más superficie para auth/permission bugs.
❗ Necesidad de docs de API + widget embebible eventual.

## Alternativas consideradas

- "Hacerlo en /verificar con cookies anónimas" → no escala, no permite
  notificaciones, no permite multi-usuario corporativo.
- "Solo API sin UI" → no es accesible para non-tech buyers.
