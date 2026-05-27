import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

/**
 * Tests del hook useFocusTrap.
 * Verifica:
 *   - Tab ciclo: último → primero
 *   - Shift+Tab ciclo: primero → último
 *   - Auto-focus al primer focusable
 */

function ModalHarness({ active }: { active: boolean }) {
  const ref = useFocusTrap<HTMLDivElement>(active)
  return (
    <>
      <button>Antes del modal</button>
      {active && (
        <div ref={ref} role="dialog" aria-label="test modal">
          <button>Primero</button>
          <input placeholder="Medio" />
          <button>Último</button>
        </div>
      )}
    </>
  )
}

describe('useFocusTrap', () => {
  it('enfoca el primer focusable al activarse', () => {
    render(<ModalHarness active={true} />)
    const first = screen.getByText('Primero')
    expect(document.activeElement).toBe(first)
  })

  it('Tab desde el último vuelve al primero', () => {
    render(<ModalHarness active={true} />)
    const first = screen.getByText('Primero')
    const last = screen.getByText('Último')

    // Manualmente enfocamos el último para simular llegar via Tab
    last.focus()
    expect(document.activeElement).toBe(last)

    // Tab → debería ir al primero
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
  })

  it('Shift+Tab desde el primero salta al último', () => {
    render(<ModalHarness active={true} />)
    const first = screen.getByText('Primero')
    const last = screen.getByText('Último')

    first.focus()
    expect(document.activeElement).toBe(first)

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('no hace nada si active=false', () => {
    const { container } = render(<ModalHarness active={false} />)
    // El modal no se renderiza, solo el botón antes
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })
})

describe('useFocusTrap integración con state', () => {
  function App() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button onClick={() => setOpen(true)}>Abrir</button>
        {open && <ModalHarness active={true} />}
      </>
    )
  }

  it('integración con click → abrir → trap aplicado', () => {
    render(<App />)
    const opener = screen.getByText('Abrir')
    fireEvent.click(opener)
    // Después del click, el modal está abierto y el foco fue al primer
    // botón "Primero" del modal
    const first = screen.getByText('Primero')
    expect(document.activeElement).toBe(first)
  })
})
