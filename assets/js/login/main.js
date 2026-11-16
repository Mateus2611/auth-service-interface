import { autenticarUsuario } from "./api.js";
import {
    obterDadosFormulario,
    validarFormulario,
    exibirAlerta,
    ocultarAlerta,
    alternarCarregamento
} from "./interface.js";

const MONOLITO_HOME_URL = "http://localhost:8085/";
const loginForm = document.getElementById("login-form");

function salvarTokenNoCookie(token) {
    document.cookie = `jwt_token=${token}; path=/; max-age=7200; SameSite=Lax`;
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    ocultarAlerta();

    const { email, password } = obterDadosFormulario();

    if (!validarFormulario(email, password)) {
        return;
    }

    alternarCarregamento(true);

    try {
        const data = await autenticarUsuario(email, password);
        salvarTokenNoCookie(data.token);
        window.location.href = MONOLITO_HOME_URL;
    } catch (error) {
        const mensagem = error.name === "TypeError"
            ? "Não foi possível conectar ao servidor de autenticação."
            : error.message;

        exibirAlerta(mensagem);
    } finally {
        alternarCarregamento(false);
    }
});