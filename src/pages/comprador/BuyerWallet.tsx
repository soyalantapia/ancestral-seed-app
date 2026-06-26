import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Plus,
  Search,
  Bell,
  Download,
  Trash2,
  Building2,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/features/Header'
import { Footer } from '@/components/features/Footer'
import { useBuyerWalletStore, type SavedCert } from '@/store/buyerWallet'
import { PageMeta } from '@/components/features/PageMeta'

const DEMO_CERTS: SavedCert[] = [
  {
    hash: '0xAS-CERT-CE001ABF9D',
    productName: 'Filigrana ancestral',
    authorName: 'Camila Montes',
    category: 'ancestral',
    status: 'vigente',
    savedAt: '2026-02-12',
  },
  {
    hash: '0xAS-CERT-CE002BCA3F',
    productName: 'Tejido en telar',
    authorName: 'Flor Imbacuán Pantoja',
    category: 'tradicional',
    status: 'vigente',
    savedAt: '2026-03-04',
  },
  {
    hash: '0xAS-CERT-CE015DDE8E',
    productName: 'Sahumerio · Limpieza espiritual',
    authorName: 'María Belén Bauló',
    category: 'tradicional',
    status: 'renovacion',
    savedAt: '2026-04-22',
    note: 'Pedir comprobante de auditoría 2026 antes del 30/05',
  },
]

const STATUS_META: Record<
  SavedCert['status'],
  { label: string; color: string }
> = {
  vigente: { label: 'Vigente', color: 'bg-success-100 text-success-300' },
  renovacion: { label: 'En renovación', color: 'bg-warning-100 text-warning-400' },
  vencido: { label: 'Vencido', color: 'bg-info-100 text-info-400' },
  suspendido: { label: 'Suspendido', color: 'bg-error-100 text-error-400' },
  denegado: { label: 'Denegado', color: 'bg-error-100 text-error-400' },
}

/**
 * Fix #FEAT-01 (análisis proyecto): página principal del rol
 * Comprador B2B. Marca/distribuidor mantiene una wallet de los
 * certs de sus proveedores y recibe alertas cuando alguno cambia.
 */
export default function BuyerWallet() {
  const store = useBuyerWalletStore()
  const [hash, setHash] = useState('')
  // Mostramos siempre los 3 ejemplos de demo (deduplicados por hash) junto a
  // lo que el usuario agregó, para que al sumar el primer cert real no
  // desaparezcan de golpe.
  const certs = [
    ...DEMO_CERTS.filter((d) => !store.certs.some((c) => c.hash === d.hash)),
    ...store.certs,
  ]
  const [query, setQuery] = useState('')
  const filtered = certs.filter(
    (c) =>
      c.productName.toLowerCase().includes(query.toLowerCase()) ||
      c.authorName.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <PageMeta
        title="Wallet de certificaciones · Ancestral Seed para marcas"
        description="Gestioná las certificaciones de tus proveedores y recibí alertas cuando cambia el estado."
      />
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-8 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              <ShoppingBag className="h-3 w-3" />
              Para marcas y distribuidores
            </div>
            <h1 className="mt-3 text-3xl font-bold text-navy-500 md:text-4xl">
              Wallet de certificaciones
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-navy-300 md:text-base">
              Guardá los certs de tus proveedores. Te avisamos cuando
              alguno cambia de estado, vence o se suspende. Ideal para
              ecommerce, retail y exportadores.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              toast.info(
                'En prod: API key del comprador habilita verify-batch + webhook de cambios',
              )
            }}
            className="inline-flex items-center gap-2 rounded-full border border-navy-500 bg-white px-4 py-2 text-xs font-bold text-navy-500 hover:bg-neutral-100"
          >
            <Building2 className="h-3.5 w-3.5" />
            API key
          </button>
        </div>

        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Pegá el hash o link del cert (0xAS-CERT-…)"
                  className="h-11 w-full rounded-full border border-neutral-300 bg-white pl-9 pr-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!hash) {
                    toast.error('Pegá un hash primero')
                    return
                  }
                  store.add({
                    hash,
                    productName: 'Producto pendiente de verificar',
                    authorName: '—',
                    category: 'tradicional',
                    status: 'vigente',
                    savedAt: new Date().toISOString().slice(0, 10),
                  })
                  setHash('')
                  toast.success('Cert agregado a tu wallet')
                }}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-navy-500 px-5 text-xs font-bold text-white hover:bg-navy-400"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <div className="relative flex-1">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-300" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar por producto o autor…"
                className="h-9 w-full rounded-full border border-neutral-300 bg-white pl-9 pr-3 text-xs text-navy-500 focus:border-gold-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => toast.info('Mock — en prod exporta CSV')}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 hover:bg-neutral-100"
            >
              <Download className="h-3 w-3" />
              Exportar
            </button>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-neutral-100 text-navy-300">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest">
                    Autor
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-navy-300"
                    >
                      No hay certs con ese filtro
                    </td>
                  </tr>
                )}
                {filtered.map((c) => {
                  const m = STATUS_META[c.status]
                  return (
                    <tr key={c.hash} className="hover:bg-neutral-100/60">
                      <td className="px-4 py-3">
                        <p className="font-bold text-navy-500">
                          {c.productName}
                        </p>
                        <code className="text-[10px] text-navy-300">
                          {c.hash}
                        </code>
                        {c.note && (
                          <p className="mt-1 rounded bg-warning-100/40 px-2 py-0.5 text-[10px] font-semibold text-warning-400">
                            📝 {c.note}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-navy-500">
                        {c.authorName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-700">
                          {c.category === 'ancestral'
                            ? 'Ancestral'
                            : c.category === 'tradicional'
                              ? 'Tradicional'
                              : 'Inspiración'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${m.color}`}
                        >
                          {m.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (store.certs.length === 0) {
                              toast.info('Ejemplo de demo — agregá un cert real para gestionarlo')
                              return
                            }
                            store.remove(c.hash)
                            toast.success('Cert removido de tu wallet')
                          }}
                          aria-label="Remover"
                          className="rounded-full p-1.5 text-navy-300 hover:bg-error-100 hover:text-error-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-2xl border border-info-200 bg-info-100/30 p-4">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-info-400" />
              <div className="text-xs leading-relaxed text-navy-500">
                <p className="font-bold">Alertas activadas</p>
                <p className="mt-1">
                  Te avisamos por email cuando uno de tus certs guardados
                  cambia de estado (vence, se suspende o se renueva).
                  Gestionalas en{' '}
                  <Link
                    to="/notificaciones"
                    className="font-bold text-info-400 underline"
                  >
                    Notificaciones
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
