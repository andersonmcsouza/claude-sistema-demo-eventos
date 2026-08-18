from app.models.inscricao import Status


class TransicaoInvalida(Exception):
    def __init__(self, atual: Status, novo: Status):
        self.atual = atual
        self.novo = novo
        super().__init__(f"Transição inválida: {atual.value} → {novo.value}.")


class DadosInvalidos(Exception):
    """Um ou mais campos da inscrição não passaram na validação.

    Carrega todas as mensagens de uma vez para que o formulário possa
    apontar todos os problemas no mesmo envio.
    """

    def __init__(self, mensagens: list[str]):
        self.mensagens = mensagens
        super().__init__(" ".join(mensagens))
