// ===========================
//    FILTRO E BUSCA
// ===========================

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const buttons = document.querySelectorAll("#botoesFiltro button");
    const players = document.querySelectorAll(".card-jogador");

    let currentFilter = "todos";

    searchInput.addEventListener("input", () => filtrar());

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("ativo"));
            btn.classList.add("ativo");

            currentFilter = btn.dataset.pos;
            filtrar();
        });
    });

    function filtrar() {
        const text = searchInput.value.toLowerCase();

        players.forEach(card => {
            const img = card.querySelector("img");
            const pos = img.alt.toLowerCase();
            const nome = img.dataset.nome.toLowerCase();

            const matchTexto = nome.includes(text) || pos.includes(text);
            const matchFiltro = currentFilter === "todos" || pos === currentFilter;

            card.style.display = (matchTexto && matchFiltro) ? "flex" : "none";
        });
    }
});


// ===========================
// CONTAGEM REGRESSIVA
// ===========================

function atualizarContador() {
    const dataJogo = new Date("2025-12-12T19:00:00");
    const agora = new Date();

    const diferenca = dataJogo - agora;

    if (diferenca <= 0) {
        document.getElementById("contador").textContent = "O jogo começou!";
        return;
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    document.getElementById("dias").textContent = dias;
    document.getElementById("horas").textContent = horas;
    document.getElementById("minutos").textContent = minutos;
    document.getElementById("segundos").textContent = segundos;
}

setInterval(atualizarContador, 1000);


// ===========================
// TABELA + API
// ===========================

let partidas = [];
let editIndex = null;

// Carregar do servidor
async function carregarPartidas() {
    const res = await fetch("http://localhost:3000/partidas");
    partidas = await res.json();
    atualizarTabela();
}

// Exibir "-" caso não tenha placar
function formatDisplayPlacar(placar) {
    if (!placar || placar.trim() === "") return "-";
    return placar;
}

function atualizarTabela() {
    const tbody = document.querySelector("#tabelaPartidas tbody");
    tbody.innerHTML = "";

    partidas.sort((a, b) => new Date(a.data) - new Date(b.data));

    partidas.forEach((p, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.time1}</td>
            <td>${formatDisplayPlacar(p.placar)}</td>
            <td>${p.time2}</td>
            <td>${p.data}</td>
            <td>
                <button class="editar" onclick="editarPartida(${index})">Editar</button>
                <button class="excluir" onclick="excluirPartida(${index})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Validar data
function validarData(dataStr) {
    if (!dataStr) return false;
    const d = new Date(dataStr);
    return !isNaN(d.getTime());
}

// Salvar / editar com API
document.getElementById("formPartida").addEventListener("submit", async function (e) {
    e.preventDefault();

    const time1 = document.getElementById("time1").value.trim();
    const time2 = document.getElementById("time2").value.trim();
    const placar = document.getElementById("placar").value.trim();
    const data = document.getElementById("data").value;

    if (!time1) return alert("Preencha o Time 1.");
    if (!time2) return alert("Preencha o Time 2.");
    if (!validarData(data)) return alert("Escolha uma data válida.");

    const partida = { time1, time2, placar, data };

    // Editar
    if (editIndex !== null) {
        await fetch(`http://localhost:3000/partidas/${partidas[editIndex].id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(partida)
        });

        editIndex = null;
        document.getElementById("btnSalvar").textContent = "Adicionar Partida";
    }
    // Criar
    else {
        await fetch("http://localhost:3000/partidas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(partida)
        });
    }

    carregarPartidas();
    this.reset();
});

// Editar UI
function editarPartida(i) {
    editIndex = i;
    const p = partidas[i];

    document.getElementById("time1").value = p.time1;
    document.getElementById("time2").value = p.time2;
    document.getElementById("placar").value = p.placar;
    document.getElementById("data").value = p.data;

    document.getElementById("btnSalvar").textContent = "Salvar Alterações";
}

// Excluir
async function excluirPartida(i) {
    if (!confirm("Deseja excluir esta partida?")) return;

    await fetch(`http://localhost:3000/partidas/${partidas[i].id}`, {
        method: "DELETE"
    });

    carregarPartidas();
}

// Carregar ao abrir a página
carregarPartidas();
