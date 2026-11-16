const alertCard = document.getElementById("alert-card");
const alertText = document.getElementById("alert-text");
const btnEntrar = document.getElementById("btn-entrar");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

export function obterDadosFormulario() {
    return {
        email: emailInput.value.trim(),
        password: passwordInput.value
    };
}

export function validarFormulario(email, password) {
    if (!email || !password) {
        exibirAlerta("Preencha o e-mail e a senha.");
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        exibirAlerta("Digite um formato de e-mail válido.");
        emailInput.focus();
        return false;
    }

    return true;
}

export function exibirAlerta(mensagem) {
    alertText.textContent = mensagem;
    alertCard.style.display = "flex";
}

export function ocultarAlerta() {
    alertCard.style.display = "none";
}

export function alternarCarregamento(carregando) {
    btnEntrar.disabled = carregando;
    btnEntrar.textContent = carregando ? "ENTRANDO..." : "ENTRAR";
}