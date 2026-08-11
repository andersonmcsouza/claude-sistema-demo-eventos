import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { listarInscricoes, type Categoria, type Inscricao, type Status } from '../api/inscricoes'
import { ROTULOS } from './StatusBadge'

const STATUS: Status[] = ['pendente', 'confirmada', 'lista_de_espera', 'check_in_feito']
const CATEGORIAS: Categoria[] = ['participante', 'palestrante', 'vip', 'imprensa']

const ROTULOS_CATEGORIA: Record<Categoria, string> = {
  participante: 'Participante',
  palestrante: 'Palestrante',
  vip: 'VIP',
  imprensa: 'Imprensa',
}

const contarPor = <T extends string>(inscricoes: Inscricao[], chave: (i: Inscricao) => T) =>
  inscricoes.reduce(
    (acc, i) => ({ ...acc, [chave(i)]: (acc[chave(i)] ?? 0) + 1 }),
    {} as Record<T, number>,
  )

export function PainelResumo() {
  const { pathname } = useLocation()
  const [inscricoes, setInscricoes] = useState<Inscricao[] | null>(null)

  useEffect(() => {
    listarInscricoes().then(setInscricoes).catch(() => setInscricoes(null))
  }, [pathname])

  if (!inscricoes) return null

  const porStatus = contarPor(inscricoes, (i) => i.status)
  const porCategoria = contarPor(inscricoes, (i) => i.categoria)

  return (
    <section className="painel" aria-label="Resumo das inscrições">
      <div className="container painel-grade">
        <div className="painel-tile">
          <span className="painel-numero">{inscricoes.length}</span>
          <span className="painel-rotulo">Inscrições</span>
        </div>
        <div className="painel-tile">
          <span className="painel-rotulo">Por status</span>
          <ul className="painel-lista">
            {STATUS.map((s) => (
              <li key={s}>
                <span
                  className="painel-ponto"
                  style={{ background: `var(--cor-status-${s.replaceAll('_', '-')})` }}
                />
                {ROTULOS[s]} <strong>{porStatus[s] ?? 0}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="painel-tile">
          <span className="painel-rotulo">Por categoria</span>
          <ul className="painel-lista">
            {CATEGORIAS.map((c) => (
              <li key={c}>
                {ROTULOS_CATEGORIA[c]} <strong>{porCategoria[c] ?? 0}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
