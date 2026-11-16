const API_BASE_URL = "http://localhost:8081/api/auth";

function getAuthToken() {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find(row => row.startsWith("jwt_token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
}

function getAuthHeaders() {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

async function tratarResposta(response) {
    if (response.status === 401) {
        window.location.replace("./login.html");
        throw new Error("Sessão expirada. Faça login novamente.");
    }
    if (response.status === 403) {
        throw new Error("Você não tem permissão para realizar esta operação.");
    }
    if (!response.ok) {
        let mensagemErro = "Erro ao processar a requisição no servidor.";
        try {
            const errData = await response.json();
            if (errData.message || errData.erro) {
                mensagemErro = errData.message || errData.erro;
            }
        } catch (_) {}
        throw new Error(mensagemErro);
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export async function listarUsuarios() {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    return tratarResposta(response);
}

export async function cadastrarUsuario(dados) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
    });
    return tratarResposta(response);
}

export async function atualizarUsuario(id, dados) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
    });
    return tratarResposta(response);
}

export async function alternarStatusUsuario(id, ativo) {
    const endpoint = ativo ? "activate" : "deactivate";
    const response = await fetch(`${API_BASE_URL}/users/${id}/${endpoint}`, {
        method: "PATCH",
        headers: getAuthHeaders()
    });
    return tratarResposta(response);
}