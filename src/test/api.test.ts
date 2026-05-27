import { describe, it, expect } from 'vitest'
import { ApiError } from '@/services/api'
import { ERRORS, ROLES, STAGES, ACTIONS } from '@/lib/copy'

/**
 * Tests del módulo de servicios + glosario de copy.
 * Verifica el shape público que consumen los componentes.
 */
describe('ApiError', () => {
  it('construye con code + message + status', () => {
    const err = new ApiError('not_found', 'No existe', 404)
    expect(err.code).toBe('not_found')
    expect(err.message).toBe('No existe')
    expect(err.status).toBe(404)
    expect(err.name).toBe('ApiError')
    expect(err).toBeInstanceOf(Error)
  })

  it('status es opcional para errors sin response (network)', () => {
    const err = new ApiError('network', ERRORS.network)
    expect(err.status).toBeUndefined()
    expect(err.code).toBe('network')
  })

  it('hereda de Error y se puede throw/catch', () => {
    try {
      throw new ApiError('server', ERRORS.serverError, 500)
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect(e).toBeInstanceOf(Error)
      if (e instanceof ApiError) {
        expect(e.code).toBe('server')
      }
    }
  })
})

describe('lib/copy ERRORS', () => {
  it('todos los códigos del ApiError tienen mensaje en ERRORS', () => {
    expect(ERRORS.network).toBeTruthy()
    expect(ERRORS.notFound).toBeTruthy()
    expect(ERRORS.serverError).toBeTruthy()
    expect(ERRORS.unauthorized).toBeTruthy()
    expect(ERRORS.forbidden).toBeTruthy()
    expect(ERRORS.unknown).toBeTruthy()
  })

  it('los mensajes están en español natural (no técnico)', () => {
    expect(ERRORS.network).toMatch(/conexión|internet/i)
    expect(ERRORS.notFound).toMatch(/no encontramos|no existe/i)
    expect(ERRORS.serverError).toMatch(/probá|intentá|minutos/i)
  })
})

describe('lib/copy STAGES', () => {
  it('tiene los 8 estados canónicos del journey', () => {
    expect(STAGES.postulado).toBeDefined()
    expect(STAGES.revision).toBeDefined()
    expect(STAGES.elegible).toBeDefined()
    expect(STAGES.prediagnostico).toBeDefined()
    expect(STAGES.diagnostico).toBeDefined()
    expect(STAGES.auditoria).toBeDefined()
    expect(STAGES.evaluacion).toBeDefined()
    expect(STAGES.certificacion).toBeDefined()
  })

  it('cada stage tiene id y label', () => {
    for (const stage of Object.values(STAGES)) {
      expect(stage.id).toBeTruthy()
      expect(stage.label).toBeTruthy()
      expect(typeof stage.label).toBe('string')
    }
  })
})

describe('lib/copy ACTIONS', () => {
  it('tiene las 3 acciones core del producto', () => {
    expect(ACTIONS.certify).toBe('Certificar producto')
    expect(ACTIONS.verify).toBe('Verificar certificado')
    expect(ACTIONS.signEvaluation).toContain('firmar')
  })
})

describe('lib/copy ROLES.tutor', () => {
  it('singular y plural correctos', () => {
    expect(ROLES.tutor.label).toBe('Tutor cultural')
    expect(ROLES.tutor.plural).toBe('Tutores culturales')
  })
})
