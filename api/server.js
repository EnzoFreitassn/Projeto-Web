const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");

let partidas = [];

// Carregar dados do JSON
function carregarDados() {
    if (fs.existsSync(DATA_FILE)) {
        partidas = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } else {
        partidas = [];
        fs.writeFileSync(DATA_FILE, JSON.stringify(partidas, null, 2));
    }
}

// Salvar no JSON
function salvarDados() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(partidas, null, 2));
}

carregarDados();


// GET — listar partidas
app.get("/partidas", (req, res) => {
    res.json(partidas);
});

// POST — adicionar partida
app.post("/partidas", (req, res) => {
    const { time1, placar, time2, data } = req.body;

    if (!time1 || !time2 || !data) {
        return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    const nova = {
        id: uuidv4(),
        time1,
        placar: placar || "",
        time2,
        data
    };

    partidas.push(nova);
    salvarDados();

    res.status(201).json(nova);
});

// PUT — editar partida
app.put("/partidas/:id", (req, res) => {
    const { id } = req.params;
    const index = partidas.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Partida não encontrada." });
    }

    const { time1, placar, time2, data } = req.body;

    partidas[index] = {
        ...partidas[index],
        time1,
        placar,
        time2,
        data
    };

    salvarDados();
    res.json(partidas[index]);
});

// DELETE — excluir partida
app.delete("/partidas/:id", (req, res) => {
    const { id } = req.params;
    const index = partidas.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Partida não encontrada." });
    }

    const removida = partidas.splice(index, 1)[0];
    salvarDados();

    res.json({ removida });
});

app.listen(3000, () => {
    console.log("API rodando em http://localhost:3000");
});
