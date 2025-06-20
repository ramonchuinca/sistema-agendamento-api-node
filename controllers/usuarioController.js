const Usuario = require('../models/Usuario')

exports.login = async (req, res) => {
  const { nome, peso, altura } = req.body
  const usuario = await Usuario.create({ nome, peso, altura })
  res.json({ usuario })
}