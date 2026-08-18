from email_validator import EmailNotValidError, validate_email

from app.models.inscricao import Inscricao, Status
from app.repositories.inscricao_repo import InscricaoRepo
from app.schemas.inscricao import InscricaoCriar
from app.services.excecoes import DadosInvalidos, TransicaoInvalida

TRANSICOES_VALIDAS: dict[Status, set[Status]] = {
    Status.pendente: {Status.confirmada, Status.lista_de_espera},
    Status.lista_de_espera: {Status.confirmada},
    Status.confirmada: {Status.check_in_feito},
    Status.check_in_feito: set(),
}

# Limites das colunas em models/inscricao.py.
TAMANHO_MAXIMO_NOME = 120
TAMANHO_MAXIMO_EMAIL = 120


class InscricaoService:
    """Regras de negócio de inscrições."""

    def __init__(self, repo: InscricaoRepo):
        self.repo = repo

    def listar(self) -> list[Inscricao]:
        return self.repo.listar()

    def obter_detalhe(self, inscricao_id: int) -> dict:
        inscricao = self.repo.buscar_por_id(inscricao_id)
        total_acompanhantes = len(inscricao.acompanhantes)
        return {
            "id": inscricao.id,
            "nome_completo": inscricao.nome_completo,
            "email": inscricao.email,
            "categoria": inscricao.categoria,
            "status": inscricao.status,
            "criado_em": inscricao.criado_em,
            "total_acompanhantes": total_acompanhantes,
        }

    def _validar(self, dados: InscricaoCriar) -> tuple[str, str]:
        """Valida nome e e-mail e devolve os valores já normalizados.

        Acumula todas as falhas antes de levantar, para o formulário mostrar
        tudo de uma vez em vez de um erro por envio.
        """
        mensagens: list[str] = []

        nome = dados.nome_completo.strip()
        if not nome:
            mensagens.append("Informe o nome completo.")
        elif len(nome) > TAMANHO_MAXIMO_NOME:
            mensagens.append(
                f"O nome completo deve ter no máximo {TAMANHO_MAXIMO_NOME} caracteres."
            )

        email = dados.email.strip()
        if not email:
            mensagens.append("Informe o e-mail.")
        elif len(email) > TAMANHO_MAXIMO_EMAIL:
            mensagens.append(
                f"O e-mail deve ter no máximo {TAMANHO_MAXIMO_EMAIL} caracteres."
            )
        else:
            try:
                # check_deliverability desligado: não consultamos DNS numa requisição.
                validate_email(email, check_deliverability=False)
            except EmailNotValidError:
                mensagens.append("Informe um e-mail válido.")

        if mensagens:
            raise DadosInvalidos(mensagens)

        return nome, email

    def criar(self, dados: InscricaoCriar) -> Inscricao:
        nome, email = self._validar(dados)
        inscricao = Inscricao(
            nome_completo=nome,
            email=email,
            categoria=dados.categoria,
            status=Status.pendente,
        )
        return self.repo.criar(inscricao)

    def mudar_status(self, inscricao_id: int, novo: Status) -> Inscricao:
        inscricao = self.repo.buscar_por_id(inscricao_id)
        atual = inscricao.status
        if novo not in TRANSICOES_VALIDAS[atual]:
            raise TransicaoInvalida(atual, novo)
        inscricao.status = novo
        return self.repo.salvar(inscricao)
