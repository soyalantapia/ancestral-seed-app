# ADR 0002 · Blockchain — disclaimer modo demo vs integración real

**Status:** Aceptado (provisional — re-evaluar Q3 2026)
**Fecha:** 2026-05-28
**Decisores:** Producto + Eng + Legal

## Contexto

Fix #FEAT-05. El BlockchainModal del cert público linkea a
`polygonscan.com/search?q=${hash}` con un hash derivado del cert id.
La consulta devuelve "No matching results found" porque el cert
NUNCA fue registrado en Polygon (es demo).

Riesgo: un periodista o un reviewer crypto-savvy verifica, no
encuentra la tx, y el titular es "Ancestral Seed miente sobre la
blockchain".

## Decisión (corto plazo)

**Disclaimer claro "Vista previa institucional · El registro en
blockchain se activa en producción Q3 2026"**.

- Banner gold-warning en el BlockchainModal con copy honesto.
- Remover el link a polygonscan o cambiarlo por un faux-explorer
  interno que muestre el "hash conceptual" sin pretender que está
  on-chain.
- Mantener el hash mostrado (sirve como ID interno único + facilita
  verificación cross-referenciada con el QR del cert físico).

## Decisión (largo plazo — Q3 2026)

Integrar **Polygon Amoy testnet** primero, luego mainnet:

1. Smart contract minimal: registra `(certId, hash, ipfsCID, issuer)`.
2. Cada cert emitido dispara una tx desde una wallet de servicio.
3. IPFS pin de la metadata del cert (titular, scoring, evidencias hashes).

Razón Polygon: gas barato, EVM compatible (futuro multi-chain),
explorer maduro, vínculo cultural con regiones LATAM que ya usan
soluciones EVM.

## Consecuencias

✅ Demo sin riesgo reputacional.
✅ Path de integración real planificado y publicado.
❗ Necesidad de operaciones (wallet seguridad, gas reserves, monitoring tx).
