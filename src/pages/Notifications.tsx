import { Bell } from 'lucide-react'

export default function Notifications() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10 md:py-10">
      <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
        Notificaciones
      </h1>
      <p className="mt-1 text-sm text-navy-300 md:text-base">
        Mantenete al tanto del avance de tus certificaciones.
      </p>

      <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 p-12 text-center">
        <Bell className="mx-auto h-10 w-10 text-navy-300" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-semibold text-navy-500">
          No tenés notificaciones nuevas
        </p>
        <p className="mt-1 text-sm text-navy-300">
          Cuando un tutor revise tu solicitud, vas a recibir un aviso acá y por
          correo.
        </p>
      </div>
    </div>
  )
}
