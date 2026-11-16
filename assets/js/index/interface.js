const tbody = document.getElementById("users-table-body");
const alertCard = document.getElementById("alert-card");
const alertText = document.getElementById("alert-text");

const modalUsuario = document.getElementById("modal-usuario");
const modalUsuarioTitulo = document.getElementById("modal-usuario-titulo");
const formUsuario = document.getElementById("form-usuario");
const inputUsuarioId = document.getElementById("usuario-id");
const inputUsuarioEmail = document.getElementById("usuario-email");
const inputUsuarioSenha = document.getElementById("usuario-senha");
const senhaHelp = document.getElementById("senha-help");
const checkboxesRoles = document.querySelectorAll('input[name="roles"]');

export function exibirAlerta(mensagem, tipo = "error") {
    alertText.textContent = mensagem;
    alertCard.className = tipo === "success" ? "alert success" : "alert";
    alertCard.style.display = "block";

    setTimeout(() => {
        alertCard.style.display = "none";
    }, 5000);
}

export function renderizarTabelaUsuarios(usuarios) {
    tbody.innerHTML = "";

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    Nenhum usuário encontrado.
                </td>
            </tr>
        `;
        return;
    }

    usuarios.forEach((user, index) => {
        const identificador = user.id ?? user.userId ?? user.uuid ?? user.email;
        const codigoExibicao = user.id ?? user.userId ?? (index + 1);
        
        const isAtivo = user.isActivate ?? user.active ?? user.ativo ?? user.enabled ?? true;
        const email = user.email ?? user.name ?? "-";
        const roles = Array.isArray(user.roles) ? user.roles : [];

        const rolesHtml = roles.length > 0
            ? roles.map(r => `<span class="role-badge">${typeof r === "object" ? (r.name ?? r.authority) : r}</span>`).join("")
            : `<span class="role-badge">Sem permissão</span>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${codigoExibicao}</td>
            <td>${email}</td>
            <td><div class="roles-cell">${rolesHtml}</div></td>
            <td>
                <span class="status-badge ${isAtivo ? "status-ativo" : "status-inativo"}">
                    ${isAtivo ? "ATIVO" : "INATIVO"}
                </span>
            </td>
            <td class="actions-cell">
                <button type="button" class="btn-action btn-edit" data-action="editar" data-id="${identificador}">
                    EDITAR
                </button>
                <button type="button" class="btn-action btn-toggle-status ${!isAtivo ? "reativar" : ""}" data-action="status" data-id="${identificador}">
                    ${isAtivo ? "DESATIVAR" : "ATIVAR"}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function abrirModalNovoUsuario() {
    formUsuario.reset();
    inputUsuarioId.value = "";
    checkboxesRoles.forEach(cb => cb.checked = false);

    modalUsuarioTitulo.textContent = "NOVO USUÁRIO";
    inputUsuarioSenha.required = true;
    senhaHelp.style.display = "none";
    modalUsuario.style.display = "flex";
}

export function abrirModalEditarUsuario(user) {
    if (!modalUsuario) return;

    formUsuario?.reset();
    if (inputUsuarioId) inputUsuarioId.value = user.id ?? user.userId ?? user.uuid ?? "";
    if (inputUsuarioEmail) inputUsuarioEmail.value = user.email ?? user.name ?? "";
    if (inputUsuarioSenha) {
        inputUsuarioSenha.value = "";
        inputUsuarioSenha.required = false;
    }
    if (senhaHelp) senhaHelp.style.display = "block";

    const userRoles = (user.roles || []).map(r => {
        const valor = typeof r === "object" ? (r.name ?? r.authority ?? r.role ?? "") : String(r);
        return valor.replace(/^ROLE_/i, "").toLowerCase();
    });

    checkboxesRoles.forEach(cb => {
        const cbValor = cb.value.replace(/^ROLE_/i, "").toLowerCase();
        cb.checked = userRoles.includes(cbValor);
    });

    if (modalUsuarioTitulo) modalUsuarioTitulo.textContent = "EDITAR USUÁRIO";
    modalUsuario.style.display = "flex";
}

export function obterDadosModalUsuario() {
    const form = document.getElementById("form-usuario");
    const id = document.getElementById("usuario-id")?.value?.trim() || "";
    const email = document.getElementById("usuario-email")?.value?.trim() || "";
    const password = document.getElementById("usuario-senha")?.value || "";

    const checkboxesMarcados = form
        ? Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
        : [];
    const rolesSelecionadas = checkboxesMarcados.map(cb => cb.value);

    const payload = {
        email: email,
        roles: rolesSelecionadas
    };

    if (password) {
        payload.password = password;
    }

    return { id, payload };
}

export function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}