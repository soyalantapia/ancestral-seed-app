/**
 * Error map global de Zod (v4) — estandariza TODOS los mensajes de
 * validación de la plataforma en español y con copy amigable.
 *
 * Por qué: sin esto, los campos sin mensaje propio mostraban los
 * defaults de Zod en inglés ("Invalid input", "Invalid input: expected
 * string, received undefined", etc.). Este map traduce los casos
 * comunes a mensajes claros.
 *
 * Precedencia en Zod 4 (de mayor a menor):
 *   1) mensaje a nivel de schema  → `.min(2, 'Mínimo 2')`
 *   2) este `customError` global
 *   3) locale / default
 * Es decir: los mensajes específicos que ya pusimos en cada schema
 * SIGUEN ganando; este map solo cubre los huecos.
 *
 * Se instala como side-effect al importar el módulo (ver main.tsx).
 */
import { z } from 'zod'

z.config({
  customError: (issue) => {
    switch (issue.code) {
      case 'invalid_type':
        // Campo vacío / sin completar (undefined, null, tipo incorrecto).
        return issue.expected === 'array'
          ? 'Seleccioná al menos una opción'
          : 'Completá este campo'

      case 'too_small': {
        const min = Number(issue.minimum)
        if (issue.origin === 'string') {
          return min <= 1 ? 'Completá este campo' : `Mínimo ${min} caracteres`
        }
        if (issue.origin === 'array' || issue.origin === 'set') {
          return min <= 1
            ? 'Seleccioná al menos una opción'
            : `Seleccioná al menos ${min} opciones`
        }
        if (issue.origin === 'number') return `El valor mínimo es ${min}`
        return 'El valor es demasiado corto'
      }

      case 'too_big': {
        const max = Number(issue.maximum)
        if (issue.origin === 'string') return `Máximo ${max} caracteres`
        if (issue.origin === 'array' || issue.origin === 'set') {
          return `Máximo ${max} opciones`
        }
        if (issue.origin === 'number') return `El valor máximo es ${max}`
        return 'El valor es demasiado largo'
      }

      case 'invalid_format': {
        if (issue.format === 'email') return 'Email inválido'
        if (issue.format === 'url') return 'Enlace (URL) inválido'
        return 'Formato inválido'
      }

      case 'invalid_value':
      case 'invalid_union':
        return 'Elegí una opción válida'

      case 'not_multiple_of':
        return 'Valor inválido'

      default:
        // Resto de casos (custom, etc.): dejamos el default de Zod.
        return undefined
    }
  },
})
