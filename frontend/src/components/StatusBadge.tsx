import type { Status } from '../api/inscricoes'

export const ROTULOS: Record<Status, string> = {
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  lista_de_espera: 'Lista de espera',
  check_in_feito: 'Check-in feito',
}

export function StatusBadge({ status }: { status: Status }) {
  const cor = `var(--cor-status-${status.replaceAll('_', '-')})`
  return (
    <span className="badge" style={{ background: cor }}>
      {ROTULOS[status]}
    </span>
  )
}
