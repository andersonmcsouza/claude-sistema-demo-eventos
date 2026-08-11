import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { PainelResumo } from './components/PainelResumo'
import { DetalheInscricao } from './pages/DetalheInscricao'
import { ListaInscricoes } from './pages/ListaInscricoes'
import { NovaInscricao } from './pages/NovaInscricao'

export function App() {
  return (
    <>
      <header className="topo">
        <div className="container">
          <Link to="/" className="marca">
            <img src="/vertigo-logo.png" alt="Vertigo — Digital Intelligence For Business" />
            <span>DevConf 2026 · Inscrições</span>
          </Link>
          <nav>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'ativo' : '')}>
              Inscrições
            </NavLink>
            <NavLink to="/nova" className={({ isActive }) => (isActive ? 'ativo' : '')}>
              Nova inscrição
            </NavLink>
          </nav>
        </div>
      </header>
      <PainelResumo />
      <Routes>
        <Route path="/" element={<ListaInscricoes />} />
        <Route path="/nova" element={<NovaInscricao />} />
        <Route path="/inscricoes/:id" element={<DetalheInscricao />} />
      </Routes>
    </>
  )
}
