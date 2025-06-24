const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: String,
  peso: Number,
  altura: Number,
  telefone: String
});

module.exports = mongoose.model('Usuario', UsuarioSchema); // << ESSE NOME PRECISA SER 'Usuario'
