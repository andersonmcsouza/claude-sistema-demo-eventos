import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  listarAcompanhantes,
  mudarStatus,
  obterInscricao,
  type Acompanhante,
  type InscricaoDetalhe,
  type Status,
} from '../api/inscricoes'
import { ROTULOS, StatusBadge } from '../components/StatusBadge'

const STATUS: Status[] = ['pendente', 'confirmada', 'lista_de_espera', 'check_in_feito']

const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

export function DetalheInscricao() {
  const { id } = useParams()
  const inscricaoId = Number(id)
  const [inscricao, setInscricao] = useState<InscricaoDetalhe | null>(null)
  const [acompanhantes, setAcompanhantes] = useState<Acompanhante[]>([])
  const [novoStatus, setNovoStatus] = useState<Status>('confirmada')
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    obterInscricao(inscricaoId).then(setInscricao).catch((e) => setErro(e.message))
    listarAcompanhantes(inscricaoId).then(setAcompanhantes).catch(() => {})
  }, [inscricaoId])

  useEffect(carregar, [carregar])

  async function aplicarStatus() {
    setErro(null)
    try {
      await mudarStatus(inscricaoId, novoStatus)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.')
    }
  }

  if (!inscricao) return <div className="container">{erro ?? 'Carregando…'}</div>

  return (
    <div className="container">
      <Link to="/" className="voltar">
        ← Voltar para inscrições
      </Link>
      <h2>{inscricao.nome_completo || '(sem nome)'}</h2>
      <div className="cartao">
        <p>
          <strong>E-mail:</strong> {inscricao.email}
        </p>
        <p>
          <strong>Categoria:</strong> {inscricao.categoria}
        </p>
        <p>
          <strong>Inscrito em:</strong> {formatarData(inscricao.criado_em)}
        </p>
        <p>
          <strong>Status:</strong> <StatusBadge status={inscricao.status} />
        </p>
        <label>
          Mudar status
          <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value as Status)}>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {ROTULOS[s]}
              </option>
            ))}
          </select>
        </label>
        <button onClick={aplicarStatus}>Aplicar</button>
        {erro && <div className="erros">{erro}</div>}
      </div>
      <div className="cartao">
        <h3>Acompanhantes ({inscricao.total_acompanhantes})</h3>
        {acompanhantes.length === 0 ? (
          <p className="vazio">Nenhum acompanhante.</p>
        ) : (
          <ul>
            {acompanhantes.map((a) => (
              <li key={a.id}>
                {a.nome}
                {a.restricao_alimentar ? ` — ${a.restricao_alimentar}` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
