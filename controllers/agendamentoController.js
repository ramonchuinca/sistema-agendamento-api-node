const Agendamento = require('../models/Agendamento');
const Usuario = require('../models/Usuario');

function gerarHorarios() {
  return ['08:00', '08:20', '08:40', '09:00', '09:20'];
}

// Criar agendamento
exports.store = async (req, res) => {
  try {
    const { data: dataStr, hora, usuario_id } = req.body;

    if (!dataStr || !hora || !usuario_id) {
      return res.status(400).json({ erro: 'Dados incompletos.' });
    }

    const [ano, mes, dia] = dataStr.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setHours(0, 0, 0, 0);

    const diaSemana = data.getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      return res.status(400).json({ erro: 'Agendamento não permitido aos sábados ou domingos.' });
    }

    const horariosPermitidos = gerarHorarios();
    if (!horariosPermitidos.includes(hora)) {
      return res.status(400).json({ erro: 'Horário inválido.' });
    }

    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const agendamentosMesmoHorario = await Agendamento.countDocuments({ data, hora });
    if (agendamentosMesmoHorario >= 1) {
      return res.status(400).json({ erro: 'Esse horário já está cheio.' });
    }

    const agendamento = new Agendamento({
      data,
      hora,
      usuario_id: usuario._id
    });

    await agendamento.save();

    return res.status(201).json({ mensagem: 'Agendamento realizado com sucesso!' });

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

// controllers/agendamentoController.js
const Agendamento = require('../models/Agendamento');
const Usuario = require('../models/Usuario');

exports.listarPainel = async (req, res) => {
  try {
    // Buscar os agendamentos e preencher dados do usuário
    const agendamentos = await Agendamento.find()
      .populate('usuario_id', 'nome telefone') // pega nome e telefone do usuário
      .sort({ data: 1, hora: 1 }); // ordena por data/hora

    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};








exports.deletarAgendamento = async (req, res) => {
  try {
    const id = req.params.id;
    await Agendamento.findByIdAndDelete(id);
    res.json({ mensagem: 'Agendamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao deletar agendamento' });
  }
};


