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
}

function inicializarTelaForbidden() {
    const payload = obterDadosToken();
    
    if (!payload) {
        window.location.replace("./login.html");
        return;
    }

    const userEmailEl = document.getElementById("user-logged-email");
    if (userEmailEl && payload.sub) {
        userEmailEl.textContent = payload.sub;
    }

    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const isAdmin = roles.some(r => {
        const roleName = (typeof r === "object" ? (r.name ?? r.authority) : String(r))
            .replace(/^ROLE_/i, "")
            .toUpperCase();
        return roleName === "ADMIN" || roleName === "SYSADMIN";
    });

    const menuSysadmin = document.getElementById("menu-sysadmin");
    if (menuSysadmin && !isAdmin) {
        menuSysadmin.style.display = "none";
    }

    document.body.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
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