import {
    listarUsuarios,
    cadastrarUsuario,
    atualizarUsuario,
    alternarStatusUsuario
} from "./api.js";

import {
    exibirAlerta,
    renderizarTabelaUsuarios,
    abrirModalNovoUsuario,
    abrirModalEditarUsuario,
    obterDadosModalUsuario,
    fecharModal
} from "./interface.js";

let listaUsuarios = [];
let ordemAscendente = true;

document.addEventListener("DOMContentLoaded", () => {
    inicializarTema();

    if (!verificarAcessoAdmin()) return;

    preencherPerfilSidebar();
    carregarUsuarios();

    document.getElementById("btn-novo-usuario")?.addEventListener("click", abrirModalNovoUsuario);

    document.getElementById("users-table-body")?.addEventListener("click", async (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const usuario = listaUsuarios.find(u => {
            const uid = u.id;
            return String(uid) === String(id);
        });
        if (!usuario) return;

        if (action === "editar") {
            abrirModalEditarUsuario(usuario);
        } else if (action === "status") {
            const isAtivoAtual = usuario.isActivate ?? usuario.active ?? usuario.ativo ?? usuario.enabled ?? true;
            const novoStatus = !isAtivoAtual;
            const acaoTexto = novoStatus ? "ativar" : "desativar";

            if (!confirm(`Deseja realmente ${acaoTexto} o usuário ${usuario.email}?`)) return;

            try {
                await alternarStatusUsuario(id, novoStatus);

                const emailLogado = obterUsuarioLogadoDoCookie();
                const emailAlvo = usuario.email ?? usuario.name;

                if (!novoStatus && emailLogado && emailLogado === emailAlvo) {
                    document.cookie = "jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                    window.location.replace("./login.html");
                    return;
                }

                exibirAlerta(`Usuário ${novoStatus ? "ativado" : "desativado"} com sucesso!`, "success");
                await carregarUsuarios();
            } catch (error) {
                exibirAlerta(error.message);
            }
        }
    });

    document.getElementById("form-usuario")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const { id, payload } = obterDadosModalUsuario();

        try {
            if (id) {
                await atualizarUsuario(id, payload);
                exibirAlerta("Usuário atualizado com sucesso!", "success");
            } else {
                await cadastrarUsuario(payload);
                exibirAlerta("Usuário cadastrado com sucesso!", "success");
            }
            fecharModal("modal-usuario");
            await carregarUsuarios();
        } catch (error) {
            exibirAlerta(error.message);
        }
    });

    document.querySelectorAll("[data-close]").forEach(btn => {
        btn.addEventListener("click", () => fecharModal(btn.dataset.close));
    });

    document.getElementById("btn-logout")?.addEventListener("click", () => {
        document.cookie = "jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        localStorage.removeItem("token");
        sessionStorage.clear();
        window.location.replace("./login.html");
    });
});

function inicializarTema() {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const iconMoon = document.getElementById("icon-moon");
    const iconSun = document.getElementById("icon-sun");

    function atualizarIconesTema(theme) {
        if (!iconMoon || !iconSun) return;
        iconMoon.style.display = theme === "dark" ? "none" : "block";
        iconSun.style.display = theme === "dark" ? "block" : "none";
    }

    atualizarIconesTema(document.documentElement.getAttribute("data-theme") || "light");

    themeToggleBtn?.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        atualizarIconesTema(newTheme);
    });
}

function preencherPerfilSidebar() {
    const cookie = document.cookie.split("; ").find(row => row.startsWith("jwt_token="));
    if (!cookie) return;

    try {
        const token = cookie.split("=")[1];
        const payload = JSON.parse(atob(token.split(".")[1]));

        const email = payload.sub || payload.email || "admin@acrillservice.com";
        const roles = Array.isArray(payload.roles) ? payload.roles : [];
        const rolePrincipal = roles.length > 0
            ? (typeof roles[0] === "object" ? (roles[0].name ?? roles[0].authority) : String(roles[0])).replace(/^ROLE_/i, "")
            : "ADMIN";

        const avatarEl = document.getElementById("sidebar-user-avatar");
        const emailEl = document.getElementById("sidebar-user-email");
        const roleEl = document.getElementById("sidebar-user-role");

        if (avatarEl) avatarEl.textContent = email.charAt(0).toUpperCase();
        if (emailEl) {
            emailEl.textContent = email;
            emailEl.title = email;
        }
        if (roleEl) roleEl.textContent = rolePrincipal.toUpperCase();
    } catch (_) {
    }
}

function verificarAcessoAdmin() {
    const cookie = document.cookie.split("; ").find(row => row.startsWith("jwt_token="));
    if (!cookie) {
        window.location.replace("./login.html");
        return false;
    }

    try {
        const token = cookie.split("=")[1];
        const payload = JSON.parse(atob(token.split(".")[1]));

        const agoraEmSegundos = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < agoraEmSegundos) {
            document.cookie = "jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            window.location.replace("./login.html");
            return false;
        }
        const roles = Array.isArray(payload.roles) ? payload.roles : [];
        const isAdmin = roles.some(r => {
            const roleName = (typeof r === "object" ? (r.name ?? r.authority) : String(r))
                .replace(/^ROLE_/i, "")
                .toUpperCase();
            return roleName === "ADMIN" || roleName === "SYSADMIN";
        });

        if (!isAdmin) {
            window.location.replace("http://localhost:8085/");
            return false;
        }

        return true;
    } catch (e) {
        document.cookie = "jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.replace("./login.html");
        return false;
    }
}

function obterUsuarioLogadoDoCookie() {
    const cookie = document.cookie.split("; ").find(row => row.startsWith("jwt_token="));
    if (!cookie) return null;
    try {
        const token = cookie.split("=")[1];
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub;
    } catch {
        return null;
    }
}

async function carregarUsuarios() {
    try {
        listaUsuarios = await listarUsuarios();
        renderizarTabelaUsuarios(listaUsuarios);
    } catch (error) {
        exibirAlerta(error.message);
    }
}