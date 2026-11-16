const AUTH_SERVICE_URL = "http://localhost:8081/api/auth/login";

export async function autenticarUsuario(email, password) {
    const response = await fetch(AUTH_SERVICE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        return await response.json();
    }

    if (response.status === 401 || response.status === 403) {
        throw new Error("Usuário ou senha inválidos.");
    }

    throw new Error("Erro ao tentar autenticar. Tente novamente mais tarde.");
}