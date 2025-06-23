const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: String,
  peso: Number,
  altura: Number,
  telefone: String
});

module.exports = mongoose.model('Usuario', UsuarioSchema); // <== esse "Usuario" precisa bater com o ref no Agendamento

