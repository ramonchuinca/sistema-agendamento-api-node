// controllers/agendamentoController.js
const Agendamento = require('../models/Agendamento');
const Usuario     = require('../models/Usuario');

/* ───────── Função auxiliar ───────── */
function gerarHorarios() {
  const horarios   = [];
  const inicio     = 8 * 60;        // 08:00
  const fim        = 9 * 60 + 20;   // 09:20
  const intervalo  = 20;

  for (let m = inicio; m <= fim; m += intervalo) {
    const h   = String(Math.floor(m / 60)).padStart(2, '0');
    const min = String(m % 60).padStart(2, '0');
    horarios.push(`${h}:${min}`);
  }
  return horarios;
}


/* ───────── 1) Criar (store) ───────── */
exports.store = async (req, res) => {
  try {
    const { usuario_id, data, hora } = req.body;
    if (!usuario_id || !data || !hora)
      return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });

    // ─── Usuário existe? ────────────────────────────────────────────────
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario)
      return res.status(404).json({ erro: 'Usuário não encontrado.' });

    // ─── Datas úteis do dia ­­­──────────────────────────────────────────
    const d        = new Date(data);
    const inicio   = new Date(d.setHours(0, 0, 0, 0));
    const fim      = new Date(d.setHours(23, 59, 59, 999));

    /* ➊  BLOQUEIA se o mesmo usuário já tiver um agendamento nesse dia */
    const jaTem = await Agendamento.findOne({
      usuario_id,
      data: { $gte: inicio, $lte: fim }
    });
    if (jaTem)
      return res.status(400).json({
        erro: 'Você já possui um agendamento nesse dia. ' +
              'Altere ou cancele o agendamento existente para escolher outro horário.'
      });

    /* ➋  Horário já ocupado? */
    const conflito = await Agendamento.findOne({
      data: { $gte: inicio, $lte: fim },
      hora
    });
    if (conflito)
      return res.status(400).json({ erro: 'Horário já preenchido.' });

    /* ➌  Limite diário (5) atingido? */
    const totalDia = await Agendamento.countDocuments({
      data: { $gte: inicio, $lte: fim }
    });
    if (totalDia >= 5)
      return res.status(400).json({ erro: 'Limite diário de 5 agendamentos atingido.' });

    // ─── Cria o agendamento ────────────────────────────────────────────
    await Agendamento.create({
      usuario_id,
      nome:     usuario.nome,
      peso:     usuario.peso,
      altura:   usuario.altura,
      telefone: usuario.telefone,
      data,
      hora
    });

    res.status(201).json({ mensagem: 'Agendamento realizado com sucesso!' });

  } catch (err) {
    console.error('Erro ao agendar:', err);
    res.status(500).json({ erro: 'Erro interno ao agendar.' });
  }
};


/* ───────── 2) Horários disponíveis ───────── */
exports.horariosDisponiveis = async (req, res) => {
  try {
    const dataStr = req.params.data;
    const todos   = gerarHorarios();
    const data    = new Date(dataStr);

    const inicio  = new Date(data.setHours(0,0,0,0));
    const fim     = new Date(data.setHours(23,59,59,999));

    const ocupados = (await Agendamento.find({
      data: { $gte: inicio, $lte: fim }
    }).select('hora')).map(a => a.hora);

    res.json(todos.filter(h => !ocupados.includes(h)));
  } catch (err) {
    console.error('Erro ao buscar horários:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar horários' });
  }
};

/* ───────── 3) Vagas restantes ───────── */
exports.vagasRestantes = async (req, res) => {
  try {
    const dataStr = req.query.data;
    if (!dataStr) return res.status(400).json({ erro: 'Data é obrigatória' });

    const d        = new Date(dataStr);
    const inicio   = new Date(d.setHours(0,0,0,0));
    const fim      = new Date(d.setHours(23,59,59,999));

    const horarios = gerarHorarios();
    const resultado = Object.fromEntries(horarios.map(h => [h, 1]));

    const agendados = await Agendamento.find({
      data: { $gte: inicio, $lte: fim }
    }).select('hora');

    agendados.forEach(a => { if (resultado[a.hora] !== undefined) resultado[a.hora] = 0; });

    res.json(resultado);
  } catch (err) {
    console.error('Erro ao carregar vagas:', err);
    res.status(500).json({ erro: 'Erro ao carregar vagas.' });
  }
};

/* ───────── 4) Painel mês corrente ───────── */
exports.listarPainel = async (req, res) => {
  try {
    const hoje        = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia   = new Date(hoje.getFullYear(), hoje.getMonth()+1, 0, 23,59,59,999);

    const ags = await Agendamento.find({
      data: { $gte: primeiroDia, $lte: ultimoDia }
    })
      .populate('usuario_id', 'nome peso altura telefone')
      .sort({ data: 1, hora: 1 });

    res.json(ags.map(a => ({
      _id:      a._id,
      nome:     a.usuario_id?.nome,
      peso:     a.usuario_id?.peso,
      altura:   a.usuario_id?.altura,
      telefone: a.usuario_id?.telefone,
      data:     a.data,
      hora:     a.hora
    })));
  } catch (err) {
    console.error('Erro ao listar painel:', err);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};

/* ───────── 5) Buscar meu agendamento do dia ───────── */
exports.meuAgendamento = async (req, res) => {
  const { data, usuario } = req.query;
  if (!data || !usuario) return res.json(null);

  const inicio = new Date(new Date(data).setHours(0,0,0,0));
  const fim    = new Date(new Date(data).setHours(23,59,59,999));

  const ag = await Agendamento.findOne({
    usuario_id: usuario,
    data: { $gte: inicio, $lte: fim }
  }).select('_id hora');

  res.json(ag); // null ou objeto
};

/* ───────── 6) Atualizar horário (impede conflito) ───────── */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { hora } = req.body;

    if (!hora) return res.status(400).json({ erro: 'Novo horário é obrigatório.' });

    const ag = await Agendamento.findById(id);
    if (!ag) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

    const horariosPermitidos = gerarHorarios();
    if (!horariosPermitidos.includes(hora))
      return res.status(400).json({ erro: 'Horário inválido.' });

    const d      = new Date(ag.data);
    const inicio = new Date(d.setHours(0,0,0,0));
    const fim    = new Date(d.setHours(23,59,59,999));

    const conflito = await Agendamento.findOne({
      _id: { $ne: ag._id },
      data: { $gte: inicio, $lte: fim },
      hora
    });
    if (conflito)
      return res.status(400).json({ erro: 'Esse horário já está preenchido.' });

    ag.hora = hora;
    await ag.save();

    res.json({ mensagem: 'Horário atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar agendamento:', err);
    res.status(500).json({ erro: 'Erro interno ao atualizar.' });
  }
};

/* ───────── 7) Remover agendamento ───────── */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await Agendamento.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

    res.json({ mensagem: 'Agendamento removido e horário liberado.' });
  } catch (err) {
    console.error('Erro ao excluir:', err);
    res.status(500).json({ erro: 'Erro interno ao excluir.' });
  }
};
