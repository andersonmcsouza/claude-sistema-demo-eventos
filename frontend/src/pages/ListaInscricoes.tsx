import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarInscricoes, type Inscricao } from '../api/inscricoes'
import { StatusBadge } from '../components/StatusBadge'

const formatarData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

export function ListaInscricoes() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    listarInscricoes()
      .then(setInscricoes)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <div className="container">
      <h2>Inscrições</h2>
      {erro && <div className="erros">{erro}</div>}
      <div className="cartao">
        {carregando ? (
          <p className="vazio">Carregando…</p>
        ) : inscricoes.length === 0 ? (
          <p className="vazio">Nenhuma inscrição ainda. Crie a primeira em “Nova inscrição”.</p>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Inscrito em</th>
                </tr>
              </thead>
              <tbody>
                {inscricoes.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <Link to={`/inscricoes/${i.id}`}>{i.nome_completo || '(sem nome)'}</Link>
                    </td>
                    <td>{i.email}</td>
                    <td>{i.categoria}</td>
                    <td>
                      <StatusBadge status={i.status} />
                    </td>
                    <td>{formatarData(i.criado_em)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
