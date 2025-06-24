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
    const { data: dataStr, hora, usuario_id } = req.body;

    if (!dataStr || !hora || !usuario_id) {
      return res.status(400).json({ erro: 'Dados incompletos.' });
    }

    // Validação da data
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setHours(0, 0, 0, 0);

    const diaSemana = data.getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      return res.status(400).json({ erro: 'Agendamento não permitido aos sábados ou domingos.' });
    }

    // Verifica se o horário está dentro do permitido
    const horariosPermitidos = gerarHorarios();
    if (!horariosPermitidos.includes(hora)) {
      return res.status(400).json({ erro: 'Horário inválido.' });
    }

    // Verifica se o usuário existe
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Verifica se já existe agendamento nesse mesmo horário e data
    const agendamentosMesmoHorario = await Agendamento.countDocuments({ data, hora });
    if (agendamentosMesmoHorario >= 1) {
      return res.status(400).json({ erro: 'Esse horário já está cheio.' });
    }

    // Criação do agendamento
    const agendamento = await Agendamento.create({
      data,
      hora,
      usuario_id: usuario._id
    });

    return res.status(201).json({
      mensagem: 'Agendamento realizado com sucesso!',
      agendamento
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
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
    if (!dataStr) return res.status(400).json({ erro: 'Data é obrigatória' });

    const data = new Date(dataStr);
    const inicioDia = new Date(data.setHours(0, 0, 0, 0));
    const fimDia = new Date(data.setHours(23, 59, 59, 999));

    const horarios = gerarHorarios();
    const agendados = await Agendamento.find({
      data: { $gte: inicioDia, $lte: fimDia }
    }).select('hora');

    const contagemPorHorario = {};
    for (const h of horarios) {
      contagemPorHorario[h] = 1; // 1 vaga por horário
    }

    for (const ag of agendados) {
      if (contagemPorHorario[ag.hora] !== undefined) {
        contagemPorHorario[ag.hora] = Math.max(0, contagemPorHorario[ag.hora] - 1);
      }
    }

    res.json(contagemPorHorario);
  } catch (err) {
    console.error('Erro ao buscar vagas por horário:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar vagas por horário' });
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











