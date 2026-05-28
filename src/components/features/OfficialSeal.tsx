import { cn } from '@/lib/utils'
import { SEAL_USAGE_RULES } from '@/lib/copy'

/**
 * Sello oficial de Ancestral Seed según Reglamento de Marca cláusula 3.2.
 *
 * El sello DEBE ir acompañado de "información adicional o leyenda" que
 * incluya:
 *   1. "Proceso certificado" — qué proceso fue certificado
 *   2. "N° de licencia" — opcional, pero recomendado
 *
 * Reglas tipográficas (3.2):
 *   - Tipografía: Montserrat regular para la leyenda
 *   - Texto centrado respecto al sello
 *   - Separación entre sello y leyenda = altura de la fuente usada
 *
 * Reglas de uso (3.3):
 *   - Permitido: páginas web, presentaciones, material publicitario,
 *     documentos contractuales, papelería corporativa
 *   - NO permitido: informes técnicos al cliente, sobre el producto
 *     físico ni embalaje
 *
 * Este componente respeta esas reglas — úsalo en cualquier lugar donde
 * el sello deba aparecer junto al output de una certificación.
 */
export interface OfficialSealProps {
  /**
   * Descripción del proceso certificado. Va debajo del sello con label
   * "Proceso certificado". Ejemplo: "Filigrana tradicional",
   * "Tejido en telar del pueblo Pasto".
   */
  processName: string
  /**
   * N° de licencia oficial (formato sugerido: AS-YYYY-XXX). Si no se
   * provee, se omite la línea — el reglamento marca este campo como
   * opcional.
   */
  licenseNumber?: string
  /** Escala visual del sello completo (logo + leyenda). */
  size?: 'sm' | 'md' | 'lg'
  /** Color del texto de la leyenda. Default: navy. */
  tone?: 'navy' | 'light'
  /**
   * Si true, muestra debajo del sello un mini-disclosure con la guía
   * de uso del Reglamento 3.3 (dónde sí / dónde NO usar el Sello).
   * Default: false para no contaminar usos decorativos. Encender en
   * vistas dedicadas al titular (perfil, descarga, dashboard).
   */
  withUsageGuide?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: { mark: 'h-14 w-14', label: 'text-[10px]', proc: 'text-xs', gap: 'gap-2' },
  md: { mark: 'h-20 w-20', label: 'text-[11px]', proc: 'text-sm', gap: 'gap-3' },
  lg: { mark: 'h-28 w-28', label: 'text-xs', proc: 'text-base', gap: 'gap-4' },
} as const

export function OfficialSeal({
  processName,
  licenseNumber,
  size = 'md',
  tone = 'navy',
  withUsageGuide = false,
  className,
}: OfficialSealProps) {
  const s = SIZE_MAP[size]
  const labelColor = tone === 'light' ? 'text-white/85' : 'text-navy-300'
  const procColor = tone === 'light' ? 'text-white' : 'text-navy-500'
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        s.gap,
        className,
      )}
      aria-label={
        licenseNumber
          ? `Sello Ancestral Seed — Proceso certificado: ${processName}. N° de licencia: ${licenseNumber}`
          : `Sello Ancestral Seed — Proceso certificado: ${processName}`
      }
    >
      {/* Marca registrada — NO alterar tipografía, colores ni referencias
          (Reglamento 3.1). */}
      <img
        src={`${import.meta.env.BASE_URL}logo-mark.png`}
        alt="Sello Ancestral Seed"
        className={cn('shrink-0', s.mark)}
      />
      {/* Leyenda obligatoria: Montserrat regular, centrada. */}
      <div className="flex flex-col items-center font-sans">
        <span
          className={cn(
            'font-medium uppercase tracking-[0.18em]',
            s.label,
            labelColor,
          )}
        >
          Proceso certificado
        </span>
        <span
          className={cn(
            'mt-0.5 font-semibold leading-tight',
            s.proc,
            procColor,
          )}
        >
          {processName}
        </span>
        {licenseNumber && (
          <span
            className={cn(
              'mt-1 font-medium tabular-nums',
              s.label,
              labelColor,
            )}
          >
            N° licencia ·{' '}
            <span className={tone === 'light' ? 'text-white' : 'text-navy-400'}>
              {licenseNumber}
            </span>
          </span>
        )}
      </div>

      {/* Guía de uso del Sello — SM6 fix. Reglamento 3.3 enumera dónde
          se puede usar y dónde NO. El titular necesita verlo cerca del
          sello para no aplicarlo sobre el producto o embalaje (lo más
          tentador y prohibido). */}
      {withUsageGuide && (
        <details className="mt-3 w-full max-w-xs rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-left text-[11px] text-navy-500 backdrop-blur-sm">
          <summary className="cursor-pointer font-bold text-navy-500">
            Cómo usar este sello (Reglamento 3.3)
          </summary>
          <div className="mt-2 space-y-1.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-success-300">
                ✓ Permitido
              </p>
              <ul className="ml-3 mt-0.5 list-disc space-y-0.5 text-navy-300">
                {SEAL_USAGE_RULES.allowed.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-error-400">
                ✗ No permitido
              </p>
              <ul className="ml-3 mt-0.5 list-disc space-y-0.5 text-navy-300">
                {SEAL_USAGE_RULES.forbidden.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}
