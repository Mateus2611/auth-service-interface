function obterDadosToken() {
    const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("jwt_token="));

    if (!cookie) return null;

    try {
        const token = cookie.split("=")[1];
        const payloadBase64 = token.split(".")[1];
        const payload = JSON.parse(atob(payloadBase64));

        const agoraEmSegundos = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < agoraEmSegundos) {
            limparCookieSessao();
            return null;
        }

        return payload;
    } catch {
        limparCookieSessao();
        return null;
    }
}

function limparCookieSessao() {
    document.cookie = "jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("token");
    sessionStorage.clear();
}

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

function inicializarTelaForbidden() {
    const payload = obterDadosToken();

    if (!payload) {
        window.location.replace("./login.html");
        return;
    }

    const email = payload.sub || payload.email || "usuario@acrillservice.com";
    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const rolePrincipal = roles.length > 0
        ? (typeof roles[0] === "object" ? (roles[0].name ?? roles[0].authority) : String(roles[0])).replace(/^ROLE_/i, "")
        : "USUÁRIO";

    const avatarEl = document.getElementById("sidebar-user-avatar");
    const emailEl = document.getElementById("sidebar-user-email");
    const roleEl = document.getElementById("sidebar-user-role");

    if (avatarEl) avatarEl.textContent = email.charAt(0).toUpperCase();
    if (emailEl) {
        emailEl.textContent = email;
        emailEl.title = email;
    }
    if (roleEl) roleEl.textContent = rolePrincipal.toUpperCase();

    const isAdmin = roles.some(r => {
        const roleName = (typeof r === "object" ? (r.name ?? r.authority) : String(r))
            .replace(/^ROLE_/i, "")
            .toUpperCase();
        return roleName === "ADMIN" || roleName === "SYSADMIN";
    });

    if (!isAdmin) {
        const menuSysadmin = document.getElementById("menu-sysadmin");
        const menuRelatorios = document.getElementById("menu-relatorios");
        if (menuSysadmin) menuSysadmin.style.display = "none";
        if (menuRelatorios) menuRelatorios.style.display = "none";
    }

    document.body.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarTema();
    inicializarTelaForbidden();

    document.getElementById("btn-voltar")?.addEventListener("click", () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "http://localhost:8085/";
        }
    });

    document.getElementById("btn-logout")?.addEventListener("click", () => {
        limparCookieSessao();
        window.location.replace("./login.html");
    });
});