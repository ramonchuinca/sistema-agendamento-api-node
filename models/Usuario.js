const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: String,
  peso: Number,
  altura: Number,
  telefone: String // 👈 novo campo adicionado
});

module.exports = mongoose.model('Usuario', usuarioSchema);
