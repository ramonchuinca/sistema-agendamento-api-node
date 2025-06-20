const Agendamento = require('../models/Agendamento')
const Usuario = require('../models/Usuario')

function gerarHorarios() {
  return ['08:00', '08:20', '08:40', '09:00', '09:20']
}

exports.horariosDisponiveis = async (req, res) => {
  const dataStr = req.params.data
  const todos = gerarHorarios()

  const data = new Date(dataStr)
  const inicioDia = new Date(data.setHours(0, 0, 0, 0))
  const fimDia = new Date(data.setHours(23, 59, 59, 999))

  const agendados = await Agendamento.find({
    data: { $gte: inicioDia, $lte: fimDia }
  }).select('hora')

  const ocupados = agendados.map(a => a.hora)
  const livres = todos.filter(h => !ocupados.includes(h))
  res.json(livres)
}

exports.agendar = async (req, res) => {
  const { data: dataStr, hora, usuario_id } = req.body

  const data = new Date(dataStr)
  const inicioDia = new Date(data.setHours(0, 0, 0, 0))
  const fimDia = new Date(data.setHours(23, 59, 59, 999))

  // Valida horário permitido
  const horariosPermitidos = gerarHorarios()
  if (!horariosPermitidos.includes(hora)) {
    return res.status(400).json({ erro: 'Horário inválido' })
  }

  // Verifica se o horário já está ocupado
  const agendamentoNoHorario = await Agendamento.findOne({
    data: { $gte: inicioDia, $lte: fimDia },
    hora
  })
  if (agendamentoNoHorario) {
    return res.status(400).json({ erro: 'Horário já ocupado' })
  }

  // Verifica se o usuário existe
  const usuario = await Usuario.findById(usuario_id)
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' })
  }

  // Cria o agendamento
  const agendamento = await Agendamento.create({ data, hora, usuario })
  res.json({ mensagem: 'Agendado com sucesso', agendamento })
}

exports.listarPainel = async (req, res) => {
  try {
    // const token = req.query.token;
    // if (token !== process.env.PAINEL_TOKEN) {
    //   return res.status(403).json({ erro: 'Acesso negado' });
    // }

    const agendamentos = await Agendamento.find()
      .populate('usuario')
      .sort({ data: 1, hora: 1 });

    console.log('Agendamentos encontrados:', agendamentos);

    res.json(agendamentos);
  } catch (error) {
    console.error('ERRO NO PAINEL SECRETO:', error);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
}


  
  exports.vagasRestantes = async (req, res) => {
  try {
    const dataStr = req.query.data
    if (!dataStr) return res.status(400).json({ erro: 'Data é obrigatória' })
  
    const data = new Date(dataStr)
    const inicioDia = new Date(data.setHours(0, 0, 0, 0))
    const fimDia = new Date(data.setHours(23, 59, 59, 999))
  
    const horarios = gerarHorarios()
  
    const agendados = await Agendamento.find({
      data: { $gte: inicioDia, $lte: fimDia }
    }).select('hora')
  
    const contagemPorHorario = {}
    for (const h of horarios) {
      contagemPorHorario[h] = 1 // apenas 1 vaga por horário
    }
  
    for (const ag of agendados) {
      if (contagemPorHorario[ag.hora] !== undefined) {
        contagemPorHorario[ag.hora] = Math.max(0, contagemPorHorario[ag.hora] - 1)
      }
    }
  
    res.json(contagemPorHorario)
  } catch (err) {
    console.error('Erro ao buscar vagas por horário:', err)
    res.status(500).json({ erro: 'Erro interno ao buscar vagas por horário' })
  }
  }

