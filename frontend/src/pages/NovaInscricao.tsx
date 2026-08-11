import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { criarInscricao, ErroDaApi, type Categoria } from '../api/inscricoes'

export function NovaInscricao() {
  const navegar = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [categoria, setCategoria] = useState<Categoria>('participante')
  const [erros, setErros] = useState<string[]>([])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErros([])
    try {
      await criarInscricao({ nome_completo: nome, email, categoria })
      navegar('/')
    } catch (erro) {
      setErros(erro instanceof ErroDaApi ? erro.mensagens : ['Erro inesperado.'])
    }
  }

  return (
    <div className="container">
      <Link to="/" className="voltar">
        ← Voltar para inscrições
      </Link>
      <h2>Nova inscrição</h2>
      <form className="cartao" onSubmit={enviar}>
        <label>
          Nome completo
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label>
          E-mail
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Categoria
          <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
            <option value="participante">Participante</option>
            <option value="palestrante">Palestrante</option>
            <option value="vip">VIP</option>
            <option value="imprensa">Imprensa</option>
          </select>
        </label>
        {erros.length > 0 && (
          <div className="erros">
            <ul>
              {erros.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
        <button type="submit">Inscrever</button>
      </form>
    </div>
  )
}
