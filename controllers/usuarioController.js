const Usuario = require('../models/Usuario');

exports.login = async (req, res) => {
  try {
    const novoUsuario = new Usuario({
      nome: req.body.nome,
      peso: req.body.peso,
      altura: req.body.altura,
      telefone: req.body.telefone // ✅ campo novo incluído
    });

    const usuario = await novoUsuario.save();

    res.json({ usuario });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
};

