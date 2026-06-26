# Imágenes de la ficha de Alunawa / Camila — dónde va cada foto

La ficha (`/certificado/tecnica-ancestral-filigrana`) ya está cableada para usar
estas rutas. Guardá cada foto que mandaste con el nombre exacto de abajo.
Formato recomendado: **.webp** (si las tenés en .jpg, convertilas o cambiá la
extensión en `src/services/mocks/data.ts`).

## PORTADA de la ficha (imagen grande / cover de la card)
- **Foto de la corona de filigrana** (close-up plateado sobre fondo oscuro)
  → guardar como: `public/gallery/alunawa/portada.webp`

## Foto de PERFIL (avatar de Camila)
- **Foto 1** — vos con tatuajes y anillos, ojos cerrados
  → guardar como: `public/authors/camila-montes.webp`

## GALERÍA del producto (carrusel de la ficha) — `public/gallery/alunawa/`
- **Foto 2** — la Reina del Carnaval con la corona (entre dos personas)
  → `public/gallery/alunawa/01.webp`
- **Foto 3** — B&N, trabajando una pieza con la lupa
  → `public/gallery/alunawa/02.webp`
- **Foto 4** — B&N, dibujando el diseño en el banco de trabajo
  → `public/gallery/alunawa/03.webp`
- **Foto 5** — la Reina sonriendo con el tocado de filigrana plateado
  → `public/gallery/alunawa/04.webp`
- **Foto 6** (si la tenés) — otra pieza/proceso
  → `public/gallery/alunawa/05.webp`

> Si tenés MENOS de 5 fotos de galería, borrá las líneas sobrantes de
> `galleryUrls` en `src/services/mocks/data.ts` (cert `c-filigrana`) para que no
> queden imágenes rotas. Si tenés MÁS, agregá `06.webp`, `07.webp`, etc. y
> sumá las líneas correspondientes.

Una vez que dropeés las fotos: `npm run build` y deploy (GH Pages / dominio).
