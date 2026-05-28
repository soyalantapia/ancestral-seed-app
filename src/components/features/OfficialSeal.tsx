import { cn } from '@/lib/utils'

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
    </div>
  )
}
