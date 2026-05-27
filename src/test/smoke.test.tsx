import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import Login from '@/pages/Login'
import Verify from '@/pages/Verify'
import { useCertifyFormStore } from '@/store/certifyForm'

/**
 * Smoke tests — verifican que los 4 flujos core no rompan en silencio.
 * No testean cada caso borde, solo el camino feliz.
 *
 * Si alguno falla, hay un bug que afecta al usuario en una de las
 * acciones principales: login, certify, verify, sign.
 */

// Helper para envolver un componente en Router (los componentes usan
// Link / useNavigate y necesitan contexto de Router)
function renderWithRouter(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Login form', () => {
  it('renderiza inputs y muestra errores de validación al submit vacío', async () => {
    renderWithRouter(<Login />)

    // El form tiene H1 "Iniciar sesión"
    expect(
      screen.getByRole('heading', { name: /Iniciar sesión/i }),
    ).toBeInTheDocument()
    // Inputs email + password (los labels usan htmlFor → input.id)
    const email = document.getElementById('email')
    const password = document.getElementById('password')
    expect(email).toBeInTheDocument()
    expect(password).toBeInTheDocument()

    // Submit con campos vacíos dispara errores de zod
    const submitBtn = screen.getByRole('button', { name: /Iniciar sesión/i })
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument()
      expect(screen.getByText(/Mínimo 6 caracteres/i)).toBeInTheDocument()
    })
  })
})

describe('Verify form', () => {
  it('renderiza header + abre modal al hacer click en "Ingresar Hash"', async () => {
    renderWithRouter(<Verify />)

    expect(screen.getByRole('heading', { name: /Verificar certificado/i })).toBeInTheDocument()

    const hashBtn = screen.getByRole('button', { name: /Ingresar Hash/i })
    fireEvent.click(hashBtn)

    await waitFor(() => {
      // El modal abre un input para hash con placeholder ejemplo
      const input = screen.getByPlaceholderText(/Ej\.:/i)
      expect(input).toBeInTheDocument()
    })
  })
})

describe('CertifyForm store', () => {
  it('updateData mergea data correctamente', () => {
    const { updateData } = useCertifyFormStore.getState()
    updateData({ applicantName: 'Test User' })
    expect(useCertifyFormStore.getState().data.applicantName).toBe('Test User')
    // Otros campos siguen intactos (merge, no replace)
    expect(useCertifyFormStore.getState().data.phonePrefix).toBe('+54')
  })

  it('setStep actualiza el paso actual', () => {
    const { setStep } = useCertifyFormStore.getState()
    setStep(3)
    expect(useCertifyFormStore.getState().step).toBe(3)
    // Volver a 0 para no pisar otros tests
    setStep(0)
  })
})

describe('lib/copy glosario', () => {
  it('STAGES.prediagnostico existe y tiene label correcto', async () => {
    const { STAGES } = await import('@/lib/copy')
    expect(STAGES.prediagnostico).toBeDefined()
    expect(STAGES.prediagnostico.label).toBe('Prediagnóstico')
  })

  it('ROLES tiene los 4 canónicos', async () => {
    const { ROLES } = await import('@/lib/copy')
    expect(ROLES.tutor.label).toBe('Tutor cultural')
    expect(ROLES.postulante.label).toBe('Postulante')
    expect(ROLES.autor.label).toBe('Autor')
    expect(ROLES.verificador.label).toBe('Verificador')
  })
})
