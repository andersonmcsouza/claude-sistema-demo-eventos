def test_criar_inscricao_valida_retorna_201(client):
    resposta = client.post(
        "/api/inscricoes",
        json={
            "nome_completo": "Rafael Nogueira",
            "email": "rafael.nogueira@exemplo.com.br",
            "categoria": "participante",
        },
    )
    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["nome_completo"] == "Rafael Nogueira"
    assert corpo["status"] == "pendente"


def test_criar_inscricao_aplica_trim_no_nome_e_no_email(client):
    resposta = client.post(
        "/api/inscricoes",
        json={
            "nome_completo": "  Rafael Nogueira  ",
            "email": "  rafael.nogueira@exemplo.com.br  ",
            "categoria": "participante",
        },
    )
    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["nome_completo"] == "Rafael Nogueira"
    assert corpo["email"] == "rafael.nogueira@exemplo.com.br"


def mensagens(resposta):
    return [erro["msg"] for erro in resposta.json()["detail"]]


def test_criar_inscricao_sem_nome_retorna_422(client):
    resposta = client.post(
        "/api/inscricoes",
        json={
            "nome_completo": "",
            "email": "rafael.nogueira@exemplo.com.br",
            "categoria": "participante",
        },
    )
    assert resposta.status_code == 422
    assert mensagens(resposta) == ["Informe o nome completo."]


def test_criar_inscricao_com_nome_so_de_espacos_retorna_422(client):
    resposta = client.post(
        "/api/inscricoes",
        json={
            "nome_completo": "   ",
            "email": "rafael.nogueira@exemplo.com.br",
            "categoria": "participante",
        },
    )
    assert resposta.status_code == 422
    assert mensagens(resposta) == ["Informe o nome completo."]


def test_criar_inscricao_com_email_invalido_retorna_422(client):
    resposta = client.post(
        "/api/inscricoes",
        json={
            "nome_completo": "Mônica Lima",
            "email": "monica.lima.devconf.com.br",
            "categoria": "participante",
        },
    )
    assert resposta.status_code == 422
    assert mensagens(resposta) == ["Informe um e-mail válido."]


def test_criar_inscricao_acumula_erros_de_nome_e_email(client):
    resposta = client.post(
        "/api/inscricoes",
        json={"nome_completo": "", "email": "", "categoria": "participante"},
    )
    assert resposta.status_code == 422
    assert mensagens(resposta) == ["Informe o nome completo.", "Informe o e-mail."]


def test_criar_inscricao_com_nome_longo_demais_retorna_422(client):
    resposta = client.post(
        "/api/inscricoes",
        json={
            "nome_completo": "a" * 121,
            "email": "rafael.nogueira@exemplo.com.br",
            "categoria": "participante",
        },
    )
    assert resposta.status_code == 422
    assert mensagens(resposta) == [
        "O nome completo deve ter no máximo 120 caracteres."
    ]


def test_inscricao_invalida_nao_e_gravada(client):
    antes = len(client.get("/api/inscricoes").json())
    client.post(
        "/api/inscricoes",
        json={"nome_completo": "", "email": "nao-e-email", "categoria": "participante"},
    )
    assert len(client.get("/api/inscricoes").json()) == antes


def test_listar_retorna_registros_do_seed(client):
    resposta = client.get("/api/inscricoes")
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert len(corpo) >= 15


def test_transicao_de_status_valida_retorna_200(client):
    # No seed, a inscrição 1 está pendente
    resposta = client.patch("/api/inscricoes/1/status", json={"status": "confirmada"})
    assert resposta.status_code == 200
    assert resposta.json()["status"] == "confirmada"


def test_transicao_de_status_invalida_retorna_409(client):
    resposta = client.patch(
        "/api/inscricoes/1/status", json={"status": "check_in_feito"}
    )
    assert resposta.status_code == 409
    assert "Transição inválida" in resposta.json()["detail"]
