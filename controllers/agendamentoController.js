// controllers/agendamentoController.js

const Agendamento = require('../models/Agendamento');
const Usuario = require('../models/Usuario');

// Função auxiliar para gerar os horários permitidos
function gerarHorarios() {
  const horarios = [];
  const inicio = 8 * 60; // 08:00
  const fim = 9 * 60 + 20; // 09:20
  const intervalo = 20;

  for (let minutos = inicio; minutos <= fim; minutos += intervalo) {
    const horas = String(Math.floor(minutos / 60)).padStart(2, '0');
    const mins = String(minutos % 60).padStart(2, '0');
    horarios.push(`${horas}:${mins}`);
  }

  return horarios;
}

exports.store = async (req, res) => {
  try {
    const { usuario_id, data, hora } = req.body;

    if (!usuario_id || !data || !hora) {
      return res.status(400).json({ erro: "Campos obrigatórios ausentes." });
    }

    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    // Conversão da data
    const dataObj = new Date(data);
    const inicioDia = new Date(dataObj.setHours(0, 0, 0, 0));
    const fimDia = new Date(dataObj.setHours(23, 59, 59, 999));

    // Verifica se já existe alguém nesse horário
    const horarioOcupado = await Agendamento.findOne({
      data: { $gte: inicioDia, $lte: fimDia },
      hora: hora,
    });

    if (horarioOcupado) {
      return res.status(400).json({ erro: "Horário já preenchido." });
    }

    // Verifica se já atingiu o limite de 5 agendamentos no dia
    const totalAgendados = await Agendamento.countDocuments({
      data: { $gte: inicioDia, $lte: fimDia },
    });

    if (totalAgendados >= 5) {
      return res.status(400).json({ erro: "Limite diário de 5 agendamentos atingido." });
    }

    // Salva o agendamento
    const novoAgendamento = new Agendamento({
      usuario_id,
      nome: usuario.nome,
      peso: usuario.peso,
      altura: usuario.altura,
      telefone: usuario.telefone,
      data,
      hora,
    });

    await novoAgendamento.save();
    res.status(201).json({ mensagem: "Agendamento realizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao agendar:", err);
    res.status(500).json({ erro: "Erro interno ao agendar." });
  }
};





// Horários disponíveis
exports.horariosDisponiveis = async (req, res) => {
  try {
    const dataStr = req.params.data;
    const todos = gerarHorarios();

    const data = new Date(dataStr);
    const inicioDia = new Date(data.setHours(0, 0, 0, 0));
    const fimDia = new Date(data.setHours(23, 59, 59, 999));

    const agendados = await Agendamento.find({
      data: { $gte: inicioDia, $lte: fimDia }
    }).select('hora');

    const ocupados = agendados.map(a => a.hora);
    const livres = todos.filter(h => !ocupados.includes(h));

    res.json(livres);
  } catch (err) {
    console.error('Erro ao buscar horários disponíveis:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar horários' });
  }
};








// Vagas restantes por horário

exports.vagasRestantes = async (req, res) => {
  try {
    const dataStr = req.query.data;
    if (!dataStr) return res.status(400).json({ erro: "Data é obrigatória" });

    const data = new Date(dataStr);
    const inicioDia = new Date(data.setHours(0, 0, 0, 0));
    const fimDia = new Date(data.setHours(23, 59, 59, 999));

    const horarios = gerarHorarios();

    const agendamentos = await Agendamento.find({
      data: { $gte: inicioDia, $lte: fimDia },
    }).select("hora");

    const resultado = {};
    for (const hora of horarios) {
      resultado[hora] = 1; // Inicialmente há 1 vaga por horário
    }

    for (const ag of agendamentos) {
      if (resultado[ag.hora] !== undefined) {
        resultado[ag.hora] = 0; // Marca como indisponível
      }
    }

    res.json(resultado);
  } catch (err) {
    console.error("Erro ao carregar vagas:", err);
    res.status(500).json({ erro: "Erro ao carregar vagas." });
  }
};













// controllers/agendamentoController.js
// const Agendamento = require('../models/Agendamento');
// const Usuario = require('../models/Usuario');

// const mongoose = require('mongoose');

// const Agendamento = require('../models/Agendamento'); // certifique-se que esse import exista
// const mongoose = require('mongoose');

exports.listarPainel = async (req, res) => {
  try {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0, 23, 59, 59, 999);

    const agendamentos = await Agendamento.find({
  data: { $gte: primeiroDia, $lte: ultimoDia }
})
.populate({
  path: 'usuario_id',
  select: 'nome peso altura telefone'
})
.sort({ data: 1, hora: 1 });

const arr = agendamentos.map((agendamento) => {
  console.log('🧪 Agendamento completo:', agendamento); // <--- log linha a linha

  return {
    nome: agendamento.usuario_id?.nome,
    peso: agendamento.usuario_id?.peso,
    altura: agendamento.usuario_id?.altura,
    telefone: agendamento.usuario_id?.telefone,
    data: agendamento.data,
    hora: agendamento.hora
  };
});



    console.log('✅ Agendamentos retornados:', arr.length);
    res.json(arr);
  } catch (error) {
    console.error('❌ Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};











